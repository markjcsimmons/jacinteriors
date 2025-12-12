import re

FILE = "portfolio.html"

def fix():
    with open(FILE, 'r') as f:
        content = f.read()
    
    # Locate the block between BH Alpine and BH II
    marker = '<!-- Beverly Hills II -->'
    idx = content.find(marker)
    
    if idx != -1:
        # Check the 50 chars before
        chunk = content[idx-100:idx]
        # Count </div>
        div_count = chunk.count('</div>')
        print(f"Found {div_count} closing divs before Beverly Hills II")
        
        if div_count >= 3:
            # Remove the last </div> before the marker
            last_div_rel = chunk.rfind('</div>')
            last_div_abs = idx - 50 + last_div_rel
            
            print("Removing extra </div>...")
            content = content[:last_div_abs] + content[last_div_abs+6:]
            
            with open(FILE, 'w') as f:
                f.write(content)
            print("Fixed.")
        else:
            print("Not enough closing divs found. Structure might be different than expected.")
            print(f"Chunk: {chunk}")

if __name__ == "__main__":
    fix()

