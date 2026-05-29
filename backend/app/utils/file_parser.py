import fitz # PyMuPDF
import docx
import os

def extract_text_from_file(file_path: str) -> str:
    """Extract text from a given PDF or DOCX file."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File {file_path} not found.")

    text = ""
    ext = file_path.lower().split('.')[-1]

    if ext == 'pdf':
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
        except Exception as e:
            print(f"Error reading PDF: {e}")
    elif ext == 'docx':
        try:
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"Error reading DOCX: {e}")
    else:
        raise ValueError(f"Unsupported file format: {ext}")

    return text.strip()
