import zipfile

with zipfile.ZipFile("coloranalysisquiz.app-Performance-on-Search-2026-04-27.zip", "r") as z:
    for filename in z.namelist():
        # Handle encoding for non-ASCII filenames on macOS/Linux
        decoded_name = filename.encode('cp437').decode('utf-8', 'replace') if '?' not in filename else filename
        
        # Some zipped files might be correctly decoded by default or not, let's just use utf-8 replacement
        try:
             decoded_name = filename.encode('cp437').decode('utf-8')
        except:
             try:
                 decoded_name = filename.encode('cp437').decode('gbk')
             except:
                 decoded_name = filename

        print(f"\n--- {decoded_name} ---")
        try:
            with z.open(filename) as f:
                try:
                    content = f.read().decode('utf-8-sig')
                except UnicodeDecodeError:
                    f.seek(0)
                    content = f.read().decode('gbk')
                    
                lines = content.splitlines()
                for line in lines[:20]:
                    print(line)
        except Exception as e:
            print(f"Error reading: {e}")