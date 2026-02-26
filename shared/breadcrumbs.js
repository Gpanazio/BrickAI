/** Breadcrumb labels shared between SSR (server.js) and client (index.tsx) */
export const VIEW_LABELS = {
    works: { pt: 'Trabalhos', en: 'Works' },
    about: { pt: 'Sobre', en: 'About' },
    transmissions: { pt: 'Transmissões', en: 'Transmissions' },
    chat: { pt: 'Contato', en: 'Contact' }
};

/**
 * Build breadcrumb items array for BreadcrumbList JSON-LD.
 * @param {string} view - Current view name (home, works, about, transmissions, chat, post)
 * @param {string} lang - Language code (en or pt)
 * @param {{ title: string, canonicalUrl: string } | null} postInfo - Post info for detail pages
 * @returns {Array} BreadcrumbList itemListElement
 */
export function buildBreadcrumbItems(view, lang, postInfo = null) {
    const isEn = lang === 'en' || lang.startsWith('en');
    const items = [
        { "@type": "ListItem", "position": 1, "name": "Brick AI", "item": "https://ai.brick.mov" }
    ];

    if (view === 'home') return items;

    const parentView = view === 'post' ? 'transmissions' : view;
    const parentLabel = VIEW_LABELS[parentView];
    if (parentLabel) {
        items.push({
            "@type": "ListItem",
            "position": 2,
            "name": isEn ? parentLabel.en : parentLabel.pt,
            "item": `https://ai.brick.mov/${parentView}`
        });
    }

    if (view === 'post' && postInfo) {
        items.push({
            "@type": "ListItem",
            "position": 3,
            "name": postInfo.title || 'Article',
            "item": postInfo.canonicalUrl
        });
    }

    return items;
}
