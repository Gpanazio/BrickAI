import sys

file_path = "/Users/gabrielpanazio/BRICK TODOS PROJETOS/BrickAI/instagram_template.html"

with open(file_path, "r") as f:
    lines = f.readlines()

# 1. Slide 2 Background: replace 527-529 with Slide 1's 457-459
# First find the Slide 1 background
s1_bg_start = -1
for i, line in enumerate(lines):
    if "<!-- Fundo Escuro com Luz Muito Sutil no Centro -->" in line:
        s1_bg_start = i
        break

s1_bg_lines = lines[s1_bg_start:s1_bg_start+4]

# Find Slide 2 background
s2_bg_start = -1
for i, line in enumerate(lines):
    if "<!-- Huge red glow from the Hero section in site" in line:
        s2_bg_start = i
        break

lines = lines[:s2_bg_start] + s1_bg_lines + lines[s2_bg_start+4:]

# 2. Slide 3 Logo: replace slide-logo block with Slide 2's slide-logo block
s2_logo_start = -1
for i, line in enumerate(lines):
    if "<!-- LOGO CENTERED -->" in line and i > s2_bg_start and i < 600:
        s2_logo_start = i
        break

# Find end of s2 logo
s2_logo_end = -1
for i in range(s2_logo_start, len(lines)):
    if "</div>" in lines[i]:
        # we need to match the outermost div of slide-logo
        # Actually in slide 2 it's 14 lines long (including comment)
        if "</div>" in lines[i] and i > s2_logo_start + 11:
            s2_logo_end = i + 1
            break

s2_logo_lines = lines[s2_logo_start:s2_logo_start+15] # It's about 14 lines

s3_logo_start = -1
for i in range(600, len(lines)):
    if "<!-- LOGO CENTERED -->" in lines[i]:
        s3_logo_start = i
        break

s3_logo_end = -1
for i in range(s3_logo_start, len(lines)):
    if "<!-- GEOGRAPHIC CENTER SLAB -->" in lines[i]:
        s3_logo_end = i - 1
        break

lines = lines[:s3_logo_start] + s2_logo_lines + lines[s3_logo_end:]

# 3. Slide 3 Breathing: fix the margin-left and margin-top if animate-breathe is present
for i, line in enumerate(lines):
    if "w-[1056px]" in line and "animate-breathe" in line and "-ml-[528px]" in line:
        lines[i] = line.replace("-ml-[528px] -mt-[528px] ", "")

with open(file_path, "w") as f:
    f.writelines(lines)

print("Done")
