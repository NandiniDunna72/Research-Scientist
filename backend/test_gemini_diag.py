import asyncio
import traceback
import httpx
from app.database.database import SessionLocal
from app.models.project import ResearchProject
from app.routers.architecture import _gather_project_research_context
from app.services.architecture_service import ArchitectureService
from app.core.config import settings

async def main():
    db = SessionLocal()
    proj = db.query(ResearchProject).filter(ResearchProject.id == 137).first()
    ctx = _gather_project_research_context(proj, db)

    # Let's see the Gemini request:
    q_summary = [f"Q{q.get('id', i+1)}: {q.get('question', '')}" for i, q in enumerate(ctx["questions_data"][:5])]
    g_summary = [f"Gap {g.get('id', i+1)}: {g.get('title', '')}" for i, g in enumerate(ctx["gaps_data"][:5])]
    p_summary = [f"P{p.get('id', i+1)}: {p.get('title', '')} (Methods: {p.get('algorithms_and_models', [])})" for i, p in enumerate(ctx["papers_data"][:4])]

    method_summary = ""
    if ctx["methodology_data"]:
        ro = ctx["methodology_data"].get("research_overview", {})
        sd = ctx["methodology_data"].get("system_design", {})
        ma = ctx["methodology_data"].get("methods_and_algorithms", [])
        method_summary = f"Methodology: Approach: {ro.get('approach_summary', '')}; Algorithms: {[m.get('algorithm_name') for m in ma]}; System Design: {sd.get('architecture_overview', '')}"

    system_prompt = (
        "You are an expert Chief Research Systems Architect. "
        "Design a tailored, technically rigorous, implementation-oriented system architecture "
        "for the user's specific research problem. Do NOT confuse the AI Research Scientist platform "
        "with the proposed research solution being designed. "
        "Produce ONLY valid JSON conforming strictly to the requested schema. "
        "The architecture_diagram.source MUST be a valid Mermaid flowchart syntax (flowchart TD)."
    )

    user_prompt = f"""
Research Topic: {ctx["topic"]}
Project Description: {ctx["project_description"] or 'N/A'}
Primary Research Questions:
{chr(10).join(q_summary) if q_summary else 'No explicit research questions formulated.'}

Identified Research Gaps:
{chr(10).join(g_summary) if g_summary else 'No explicit research gaps identified.'}

Surveyed Benchmark Papers:
{chr(10).join(p_summary) if p_summary else 'No papers available.'}

Proposed Research Methodology:
{method_summary or 'Standard experimental methodology'}

Generate a structured system architecture in JSON with keys:
1. architecture_title (string)
2. architecture_type (string, e.g. 'Deep Learning Pipeline', 'Multimodal Representation & Alignment System', etc.)
3. architecture_summary (string)
4. components (list of objects: component_id, component_name, component_type, purpose, responsibilities, inputs, outputs, technologies, dependencies, related_research_questions, related_research_gaps, implementation_status ['implemented'|'proposed'|'optional'])
5. architecture_diagram (object: diagram_type='mermaid', source='flowchart TD\\n...', description='...')
6. data_flow (list of objects: step_number, source_component, destination_component, data_transferred, processing_performed, output_produced, phase)
7. technology_stack (list of objects: category, technology, role, reason_for_selection, alternatives, status)
8. data_storage_design (object: storage_paradigm, description, entities [entity_name, purpose, fields, relationships], er_diagram)
9. security_and_reliability (list of objects: dimension, description, mitigation_strategy)
10. deployment_architecture (object: deployment_model, minimum_viable_deployment, production_enhancements, hosting_components, environment_configuration, scaling_considerations)
11. architecture_justification (list of objects: objective_or_gap, architectural_choice, justification, trade_offs, related_question_ids, related_gap_ids)
12. alternative_architectures (list of objects: title, description, advantages, disadvantages, complexity, suitable_conditions, rejection_reason)
13. implementation_plan (list of objects: stage_number, stage_name, tasks, dependencies, deliverable, verification_method)
14. limitations_and_assumptions (list of objects: category, description)

Ensure the Mermaid diagram uses clean node IDs (A, B, C...) and double-quoted labels like A["Label (Detail)"] --> B["Processing Engine"].
"""
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={settings.AI_API_KEY}"
    gemini_payload = {
        "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }
    async with httpx.AsyncClient(timeout=45.0) as client:
        resp = await client.post(gemini_url, json=gemini_payload)
        print("Gemini Status Code:", resp.status_code)
        if resp.status_code != 200:
            print("Gemini Error:", resp.text)
        else:
            rj = resp.json()
            print("Finish reason:", rj["candidates"][0].get("finishReason"))
            part = rj["candidates"][0]["content"]["parts"][0]
            print("Keys in part:", list(part.keys()))
            if "text" in part:
                print("Text length:", len(part["text"]))
            else:
                print("No text in part! Part:", part)

if __name__ == "__main__":
    asyncio.run(main())
