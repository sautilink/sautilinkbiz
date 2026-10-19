# SautiLink Business

Public advertising introduction and inquiry site at https://business.sautilink.com/.

## Frontend design

The October 2026 update extends SautiLink’s light iOS-style public design with Inter, the original locally served SautiLink logo, neutral surfaces, large readable headings and blue primary actions. The page helps a visitor understand an objective, explore an existing ad offering, prepare a brief and contact the Business team.

The existing Formspree inquiry endpoint, field names, validation limits and success/error handling remain the operational workflow. This site does not contain an ads manager, campaign publisher, payment checkout or an authentication service. Illustrative previews are labelled examples, with no fabricated reach, performance results or customer endorsements.

The five existing offerings and published Starter ($199/month), Growth ($599/month) and custom Enterprise plans remain. Creative preparation advice is guidance for an inquiry; final placement, creative requirements and campaign details are agreed with the Business team. Site copy does not assert unverified audience demographics or geographic origin slogans.

## Design references

Reviewed on October 17, 2026:

- [Apple at Work](https://www.apple.com/business/): task-focused product storytelling, visual hierarchy and considered section spacing.
- [Meta Blueprint: Exploring best practices for ad creative](https://www.facebookblueprint.com/student/path/211557-exploring-best-practices-ad-creative): public course overview separates placements, formats, asset customization and creative practice.
- [Meta Blueprint: Ad formats and placements](https://www.facebookblueprint.com/student/path/253110-reels-stories-ads-course): public overview organizes creative around awareness, consideration and sales.

The references inform the page’s objective → format → preview → next-action organization. Detailed Blueprint lessons and the main Facebook Ads Guide required sign-in when reviewed; the page therefore does not claim to reproduce current Meta upload limits, delivery capabilities or performance statistics. Meta and Apple are design references, not partners or endorsements.

## Original preview photography

Generated with the built-in image-generation tool, then encoded as responsive WebP assets. The approved originals were visually checked before integration. No logos, typography, actual customer campaigns or real campaign results are embedded in the images.

| Asset | Dimensions | Purpose |
| --- | --- | --- |
| `assets/business/product-story.webp` | 1536 × 1024 | Product storytelling example |
| `assets/business/product-story-768.webp` | 768 × 512 | Smaller responsive product asset |
| `assets/business/creative-workspace.webp` | 1536 × 1024 | Collaboration and event storytelling example |
| `assets/business/creative-workspace-768.webp` | 768 × 512 | Smaller responsive collaboration asset |

### Generation prompts

#### Product still life

Use case: ads-marketing. Asset type: original product photo displayed inside clearly labelled illustrative advertising previews on SautiLink Business, a premium light iOS-style website. Create a polished photorealistic still life of an unbranded matte cobalt-blue reusable bottle, a cream canvas tote bag, and a small smooth cream ceramic cup on a warm ivory seamless studio surface. Considered sculptural arrangement, real canvas texture, carefully finished surfaces, softly rounded silhouettes. Wide landscape 3:2 composition at 1536x1024, all key objects within the central two-thirds with generous clean space so the photo can also crop to square and portrait ad previews. Soft directional daylight, gentle grounded shadows, refined editorial product photography, calm contemporary visual tone, subtle warm-neutral backdrop, blue accent. No logos, no words, no labels, no watermark, no borders, no UI, no people. This is a single photograph, not a collage or mockup.

#### Creative workspace

Use case: photorealistic-natural. Asset type: original photograph displayed inside clearly labelled illustrative advertising previews on SautiLink Business, a refined light iOS-style website. Create a candid contemporary creative-workshop scene with three fictional East African adults naturally collaborating at a pale wood table in a bright modern studio: a woman with short natural hair showing a color/material sample to a man and another woman, relaxed engaged expressions, authentic everyday smart-casual clothing in cream, charcoal and a restrained cobalt-blue accent. A closed unbranded laptop, blank sketch paper, a simple notebook and several material samples on the table. Warm soft daylight through a large window, neutral cream walls, restrained decor, polished editorial lifestyle photography with natural skin and fabric textures. Wide 3:2 composition at 1536x1024 with the people and collaboration grouped near the center, enough breathing space for square and portrait crops. No location landmarks, no flags, no text, no signs, no brand logos, no watermark, no UI, no charts, no testimonial implication. This is a single photograph, not a collage.

## Public animated icons

The Business page uses the shared SautiLink public icon assets in `assets/public-icons/`, pinned to AnimateIcons vanilla 0.1.0 and its Huge icon collection. Real resting SVG geometry is included in the HTML so navigation, cards, disclosures and actions retain their icons without JavaScript. The original SautiLink logo is retained.

The shared adapter enhances only the explicit `data-public-icon` symbols inside the page's `data-public-icons` boundary. It supports hover and keyboard focus, respects reduced motion and stops animations for hidden or offscreen content. Icons are decorative alongside visible wording; icon-only controls keep their existing accessible names. `assets/business-icons.css` handles only the Business page's icon sizing and spacing.

This presentation update preserves the inquiry form markup, Formspree endpoint, field contracts, public copy, navigation targets and existing interface behavior. Licensing and upstream provenance are retained beside the shared icon assets.

## Validation

The existing brand guard checks the self-hosted Inter assets and shared brand tokens. New UI behavior checks exercise the format selector, carousel, brief controls, mobile navigation and the inquiry form with stubbed responses; they do not send real inquiries. Verify that every referenced asset exists and that responsive image sources decode before publication.

Run the behavior checks with `node --test tests/business-ui.test.mjs`. Running `node tests/business-ui.test.mjs` also displays each of the 11 individual scenarios. The existing GitHub workflow runs the brand guard and these behavior checks on pull requests and main.

Browser rendering was unavailable in the managed environment used for this update. Source, behavior, asset and live-response checks are recorded separately from any later device review.

## Hosting

The existing `sautilinkbiz` Cloudflare Worker serves this repository through its current asset directory. Preserve `wrangler.jsonc` and the existing deployment integration. New presentation assets use versioned URLs so updated markup requests the intended files.
