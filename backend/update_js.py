import sys
import re

js_file = r'c:\Users\USER\Desktop\SHIRO IT\shiro-v2.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# Replace original click handler with new one handling scroll logic for combined page
original_click = '''  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      if (page) navigateTo(page);
    });
  });'''

scroll_logic = '''  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      
      if (page) {
          navigateTo(page);
          
          // Custom scroll for merged page
          if (page === 'build-pc-services') {
              // If clicked from 'Services' link, scroll to services section
              if (link.innerHTML.includes('nav_services') || link.getAttribute('href') === '#services') {
                  setTimeout(() => {
                      const servicesSection = document.getElementById('services-content');
                      if (servicesSection) {
                          const navbarHeight = document.querySelector('.navbar').offsetHeight || 80;
                          window.scrollTo({
                              top: servicesSection.offsetTop - navbarHeight,
                              behavior: 'smooth'
                          });
                      }
                  }, 350); // small delay to let page transition complete
              } else if (link.innerHTML.includes('nav_build') || link.getAttribute('href') === '#build-pc') {
                  // Make sure we scroll to top for Build PC
                  setTimeout(() => {
                      window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                      });
                  }, 350);
              }
          }
      }
    });
  });'''

if original_click in js:
    js = js.replace(original_click, scroll_logic)
    
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js)
    print("JS updated successfully!")
else:
    print("Could not find original click handler in JS. Found:")
    # print a context window around navLinks
    idx = js.find('navLinks.forEach((')
    if idx != -1:
        print(js[max(0, idx-50):min(len(js), idx+200)])
