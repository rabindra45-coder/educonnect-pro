

## Plan: Remove Default Placeholder Image

The file `src/assets/hero-school.jpg` is a default/placeholder school image used in two places as a fallback. The user wants it removed everywhere.

### Changes

**1. `src/components/home/HeroSection.tsx`**
- Remove the `import heroImage` line
- Change the fallback: when no hero slides exist, use a simple gradient background instead of the placeholder image (e.g., show empty string or a CSS gradient fallback)
- Update the logic: `const currentBackground = slides.length > 0 ? slides[currentSlide]?.image_url : "";` and add a conditional to not render `<img>` when no URL exists

**2. `src/pages/About.tsx`**
- Remove the `import heroImage` line
- Remove or replace the background image in the hero section with a pure CSS gradient (the gradient overlay already exists, so it will still look good without the image)

**3. Delete `src/assets/hero-school.jpg`**
- Remove the file from the project

### Result
The placeholder school image will no longer appear anywhere. The hero section will show uploaded slides from the database, and if none exist, it will display a clean gradient. The About page hero will use a gradient-only background.

