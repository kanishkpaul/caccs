import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.api.routes import router
from backend.api.library import library_router

app = FastAPI(title="CACCS-AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(library_router, prefix="/api/library")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Serve Frontend static files
# Note: we mount this last to avoid shadowing the API routes
frontend_path = os.path.join(os.getcwd(), "frontend", "dist")

# Catch-all route for SPA history mode (React Router)
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Check if we should serve a static file or the SPA index
    file_path = os.path.join(frontend_path, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Return index.html for all other routes to support client-side routing
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)
    
    return {"error": "Frontend not found or built"}
