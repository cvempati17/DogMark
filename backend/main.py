from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import os
import base64
import tempfile
from converter import convert_docx_to_md, convert_doc_to_md

app = FastAPI()

# CORS configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/convert")
async def convert_file(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    temp_dir = tempfile.mkdtemp()
    
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        filename = file.filename.lower()
        base_name = os.path.splitext(file.filename)[0]
        
        # Create output directory structure: temp_dir/{base_name}
        output_dir = os.path.join(temp_dir, base_name)
        os.makedirs(output_dir, exist_ok=True)
        
        if filename.endswith(".docx"):
            markdown_content = convert_docx_to_md(file_location, output_dir)
        elif filename.endswith(".doc"):
            markdown_content = convert_doc_to_md(file_location, output_dir)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload .doc or .docx")
            
        # Save markdown file
        md_path = os.path.join(output_dir, f"{base_name}.md")
        with open(md_path, "w", encoding="utf-8") as md_file:
            md_file.write(markdown_content)
            
        # Create ZIP file
        zip_path = os.path.join(temp_dir, f"{base_name}.zip")
        shutil.make_archive(os.path.join(temp_dir, base_name), 'zip', output_dir)
        
        # Read ZIP and encode to base64
        with open(zip_path, "rb") as zip_file:
            zip_base64 = base64.b64encode(zip_file.read()).decode('utf-8')
            
        return JSONResponse(content={
            "markdown": markdown_content,
            "filename": base_name,
            "zip_base64": zip_base64
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up uploaded file
        if os.path.exists(file_location):
            os.remove(file_location)
        # Clean up temp dir
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
