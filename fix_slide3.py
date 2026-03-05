import sys

file_path = "/Users/gabrielpanazio/BRICK TODOS PROJETOS/BrickAI/instagram_template.html"

with open(file_path, "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '<div class="content-wrapper relative z-20 h-full flex flex-col items-center py-24">' in line:
        lines[i] = '        <div class="content-wrapper">\n'
    
    if "<!-- GEOGRAPHIC CENTER SLAB -->" in line and i > 600:
        lines[i+1] = '          <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-30" style="transform: translateY(-120px);">\n'
        
    if "<!-- STANDARDIZED MONOLITH -->" in line and i > 600:
        lines[i+1] = '            <div class="relative w-[264px] h-[528px] flex items-center justify-center pointer-events-auto">\n'

    if "<!-- TEXT CONTENT -->" in line and i > 600:
        lines[i] = '          <!-- TEXT CONTENT - BELOW MONOLITH -->\n'
        lines[i+1] = '          <div class="absolute bottom-[240px] left-0 right-0 z-40 flex flex-col items-center pointer-events-none">\n'
        
    if "<!-- FOOTER HUD -->" in line and i > 600:
        lines[i+1] = '          <div class="flex items-center justify-center gap-8 pt-8 w-full">\n'
        
    # Re-add negative margins if animate-breathe is found in a div with w-[1056px]
    if "w-[1056px]" in line and "animate-breathe" in line and i > 600:
        if "-ml-[528px]" not in line:
            lines[i] = line.replace('w-[1056px] h-[1056px]', 'w-[1056px] h-[1056px] -ml-[528px] -mt-[528px]')

with open(file_path, "w") as f:
    f.writelines(lines)

print("Done")
