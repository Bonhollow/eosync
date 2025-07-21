from fastapi import APIRouter, UploadFile
from pathlib import Path
from docling.document_converter import DocumentConverter

router = APIRouter()

@router.post("/file/")
async def create_upload_file(file: UploadFile):
    converter = DocumentConverter()

    temp_path = Path("/tmp") / file.filename
    
    with temp_path.open("wb") as f:
        f.write(await file.read())

    doc = converter.convert(temp_path)

    converted_docs = doc.document.export_to_dict()

    return converted_docs