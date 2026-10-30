import sys
sys.path.append('e:/Research/backend')
from app.database.database import SessionLocal
from app.models import (
    ResearchProject, ResearchPaper, PaperAnalysis,
    LiteratureReviewGeneration, LiteratureReviewPaperSummary, LiteratureReviewTheme,
    ResearchMethodologyGeneration, ResearchPaperComparison, ArchitectureGeneration,
    ResearchGapAnalysis, ResearchQuestionGeneration
)

db = SessionLocal()
projects = db.query(ResearchProject).filter(ResearchProject.user_id == 47).order_by(ResearchProject.id).all()
print(f'User 47 has {len(projects)} projects:')
for p in projects:
    papers = db.query(ResearchPaper).filter(ResearchPaper.project_id == p.id).all()
    analyzed = [paper for paper in papers if db.query(PaperAnalysis).filter(PaperAnalysis.paper_id == paper.id).first()]
    
    lg = db.query(LiteratureReviewGeneration).filter(LiteratureReviewGeneration.project_id == p.id).order_by(LiteratureReviewGeneration.created_at.desc()).first()
    lg_sums = db.query(LiteratureReviewPaperSummary).filter(LiteratureReviewPaperSummary.generation_id == lg.id).all() if lg else []
    lg_themes = db.query(LiteratureReviewTheme).filter(LiteratureReviewTheme.generation_id == lg.id).all() if lg else []
    
    comp = db.query(ResearchPaperComparison).filter(ResearchPaperComparison.project_id == p.id).order_by(ResearchPaperComparison.created_at.desc()).first()
    meth = db.query(ResearchMethodologyGeneration).filter(ResearchMethodologyGeneration.project_id == p.id).order_by(ResearchMethodologyGeneration.version.desc()).first()
    arch = db.query(ArchitectureGeneration).filter(ArchitectureGeneration.project_id == p.id).order_by(ArchitectureGeneration.created_at.desc()).first()
    gap = db.query(ResearchGapAnalysis).filter(ResearchGapAnalysis.project_id == p.id).order_by(ResearchGapAnalysis.created_at.desc()).first()
    q = db.query(ResearchQuestionGeneration).filter(ResearchQuestionGeneration.project_id == p.id).order_by(ResearchQuestionGeneration.created_at.desc()).first()

    print(f'=== Project {p.id}: "{p.title}" ===')
    print(f'  Papers: total={len(papers)}, analyzed={len(analyzed)}')
    if lg:
        print(f'  Literature Review (ID {lg.id}): considered={lg.papers_considered}, with_analysis={lg.papers_with_analysis}, summaries={len(lg_sums)}, themes={len(lg_themes)}')
    else:
        print('  Literature Review: None')
    if comp:
        print(f'  Comparison (ID {comp.id}): compared={comp.papers_compared}, paper_ids={comp.paper_ids}')
    else:
        print('  Comparison: None')
    if meth:
        print(f'  Methodology (ID {meth.id}): considered={meth.papers_considered}, version={meth.version}')
    else:
        print('  Methodology: None')
    if arch:
        print(f'  Architecture (ID {arch.id}): title="{arch.architecture_title}"')
    else:
        print('  Architecture: None')
