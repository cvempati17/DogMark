import mammoth
import os
import sys

if sys.platform == "win32":
    import win32com.client as win32
    import pythoncom

def convert_docx_to_md(file_path):
    """Converts .docx to markdown using mammoth."""
    with open(file_path, "rb") as docx_file:
        # Disable image conversion to avoid base64 strings which look like corruption
        print(f"Converting {file_path} with image stripping enabled")
        result = mammoth.convert_to_markdown(docx_file, convert_image=lambda image: [])
        return result.value

def convert_doc_to_md(file_path):
    """Converts .doc to markdown using win32com (requires Word installed)."""
    if sys.platform != "win32":
        raise Exception("Conversion of .doc files is only supported on Windows servers with Microsoft Word installed.")

    try:
        # Initialize COM library
        pythoncom.CoInitialize()
        
        word = win32.DispatchEx("Word.Application")
        word.Visible = False
        
        abs_path = os.path.abspath(file_path)
        doc = word.Documents.Open(abs_path)
        
        # Save as .docx temporarily to use mammoth, or extract text directly
        # Using mammoth is better for formatting preservation, so let's save as docx
        temp_docx = abs_path + "x"
        doc.SaveAs2(temp_docx, FileFormat=16) # 16 is wdFormatXMLDocument (docx)
        doc.Close()
        # word.Quit() # Don't quit word if it was already open? Better to quit our instance.
        # Actually, Dispatch creates a new instance usually or attaches. 
        # Ideally we should be careful. For now, let's just close the doc.
        # If we created the app instance, we should probably quit it.
        # Let's try to quit.
        word.Quit()
        
        # Now convert the temp docx
        md_content = convert_docx_to_md(temp_docx)
        
        # Cleanup temp docx
        if os.path.exists(temp_docx):
            os.remove(temp_docx)
            
        return md_content
        
    except Exception as e:
        # If win32 fails, we might try textract or antiword if available, 
        # but for now let's just raise the error.
        print(f"Error converting .doc: {e}")
        raise e
    finally:
        pythoncom.CoUninitialize()
