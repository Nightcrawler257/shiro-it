import sys

html_file = r'c:\Users\USER\Desktop\SHIRO IT\shiro-v2.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Find and Extract Services Content
services_start = html.find('<div id="page-services" class="page">')
services_end = html.find('</div>\n\n        <!-- ========== SHOP PAGE ========== -->')

if services_start == -1 or services_end == -1:
    print("Could not find page-services block.")
    sys.exit(1)

services_content = html[services_start:services_end]
# Strip out the top level wrapper of services so it's just sections
services_content = services_content.replace('<div id="page-services" class="page">', '<!-- ========== MERGED SERVICES CONTENT ========== -->')

# 2. Find Build PC Content
build_pc_start = html.find('<div id="page-build-pc" class="page">')
build_pc_end_search = html.find('</div>\n\n        <!-- ========== CONTACT PAGE ========== -->')

if build_pc_start == -1 or build_pc_end_search == -1:
    print("Could not find page-build-pc block.")
    sys.exit(1)

# Modify Build PC opening div to build-pc-services
html = html[:build_pc_start] + html[build_pc_start:].replace('<div id="page-build-pc" class="page">', '<div id="page-build-pc-services" class="page">', 1)

# Now find the end of the new build-pc-services block
new_build_pc_end = html.find('</div>\n\n        <!-- ========== CONTACT PAGE ========== -->')

# 3. Create placeholder blocks
onsite_ariz_html = """
            <!-- Onsite Projects -->
            <section class="section" id="section-onsite">
                <div class="container">
                    <div class="section-header">
                        <span class="badge badge-red"><i class="fas fa-network-wired"></i> <span data-translate="onsite_badge">Onsite Projects</span></span>
                        <h2><span data-translate="onsite_h2_1">Expert</span> <span class="gradient-text" data-translate="onsite_h2_2">Onsite Setups</span></h2>
                    </div>
                    <div class="card" style="padding: 2rem; margin-bottom: 2rem; text-align: center;">
                        <p data-translate="onsite_desc" style="font-size: 1.1rem; color: var(--text-secondary);">
                            We provide professional onsite services including network infrastructure setup, security camera installation, and corporate IT setups. Our team ensures that your environment is equipped with reliable and secure technology solutions tailored to your specific operational needs.
                        </p>
                    </div>
                </div>
            </section>

            <!-- Ariz Digital -->
            <section class="section" id="section-ariz">
                <div class="container">
                    <div class="section-header">
                        <span class="badge badge-blue"><i class="fas fa-building"></i> <span data-translate="ariz_badge">Ariz Digital</span></span>
                        <h2><span data-translate="ariz_h2_1">Powered by</span> <span class="gradient-text" data-translate="ariz_h2_2">Ariz Digital</span></h2>
                    </div>
                    <div class="card" style="padding: 2rem; text-align: center;">
                        <p data-translate="ariz_desc" style="font-size: 1.1rem; color: var(--text-secondary);">
                            Ariz Digital is our trusted partner in delivering comprehensive digital solutions. 
                            [Detailed information about Ariz Digital will be updated here.]
                        </p>
                    </div>
                </div>
            </section>
"""

# Insert Services and Placeholders before the closing </div> of build-pc-services
html = html[:new_build_pc_end] + '\\n' + services_content + '\\n' + onsite_ariz_html + '\\n' + html[new_build_pc_end:]

# 4. Remove the old services block entirely
# Need to find it again because indices might have shifted
services_start_again = html.find('<!-- ========== SERVICES PAGE ========== -->')
services_end_again = html.find('<!-- ========== SHOP PAGE ========== -->')
if services_start_again != -1 and services_end_again != -1:
    html = html[:services_start_again] + html[services_end_again:]

# 5. Update Navigation Links
html = html.replace('data-page="build-pc"', 'data-page="build-pc-services"')
html = html.replace('data-page="services"', 'data-page="build-pc-services"')
html = html.replace('href="#build-pc"', 'href="#build-pc-services"')
html = html.replace('href="#services"', 'href="#build-pc-services"')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML merged successfully!")
