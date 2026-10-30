import sys, asyncio
sys.path.append('e:/Research/backend')
from app.database.database import SessionLocal
from app.models import (
    ResearchProject, ResearchPaper, PaperAnalysis,
    LiteratureReviewGeneration, LiteratureReviewPaperSummary, LiteratureReviewTheme,
    ResearchMethodologyGeneration, ResearchPaperComparison, ArchitectureGeneration
)
from app.routers.literature_review import _execute_literature_review_generation
from app.routers.comparison import _execute_comparison_generation
from app.routers.methodology import _execute_methodology_generation
from app.services.domain_architectures import DomainArchitectureEngine
from app.routers.architecture import _gather_project_research_context

async def resynthesize_project(project_id: int):
    db = SessionLocal()
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        print(f"Project {project_id} not found.")
        return
    
    papers = db.query(ResearchPaper).filter(ResearchPaper.project_id == project.id).all()
    user = project.user
    paper_ids = [p.id for p in papers]
    print(f"\n==========================================")
    print(f"Resynthesizing Project {project.id}: '{project.title}' (User {user.id})")
    print(f"Total papers: {len(papers)}, IDs: {paper_ids}")

    # 1. Literature Review
    lit_res = await _execute_literature_review_generation(project, user, db)
    print(f"  [1] Lit Review: considered={lit_res.papers_considered}, with_analysis={lit_res.papers_with_analysis}, summaries={len(lit_res.paper_summaries)}, themes={len(lit_res.themes)}")

    # 2. Comparison
    comp_res = await _execute_comparison_generation(project, paper_ids, user, db)
    print(f"  [2] Comparison: compared={comp_res.papers_compared}, paper_ids={comp_res.paper_ids}")

    # 3. Methodology
    meth_res = await _execute_methodology_generation(project, user, db)
    print(f"  [3] Methodology: considered={meth_res.papers_considered}, version={meth_res.version}")

    # 4. Architecture
    ctx = _gather_project_research_context(project, db)
    arch_res = DomainArchitectureEngine.synthesize(
        topic=ctx['topic'],
        project_description=ctx['project_description'],
        methodology_data=ctx['methodology_data'],
        questions_data=ctx['questions_data'],
        gaps_data=ctx['gaps_data'],
        papers_data=ctx['papers_data'],
        comparison_data=ctx['comparison_data'],
        lit_review_data=ctx['lit_review_data'],
        missing_context=[],
    )
    arch_res['project_id'] = project.id
    arch_record = ArchitectureGeneration(
        project_id=project.id,
        user_id=user.id,
        architecture_title=arch_res.get('architecture_title', f"{project.title} Architecture"),
        architecture_type=arch_res.get('architecture_type', 'System Architecture'),
        structured_architecture_result=arch_res,
    )
    db.add(arch_record)
    
    db.commit()
    print(f"  [4] Architecture: title='{arch_record.architecture_title}'")
    print(f"Project {project.id} SUCCESS!")

async def main():
    # Target all projects for active user 47
    for pid in [137, 133, 132]:
        await resynthesize_project(pid)

if __name__ == '__main__':
    asyncio.run(main())
