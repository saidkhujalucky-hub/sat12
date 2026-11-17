// The home page needs only variant labels. Question references load on demand.
export function catalogView(catalog, legacyCatalog, view = '') {
  const summary = view === 'summary';
  const selected = view && !summary
    ? catalog.variants.filter(variant => String(variant.id) === view)
    : catalog.variants;
  if (!selected.length) return null;
  const ids = new Set(selected.map(variant => variant.id));
  return {
    modules: catalog.modules,
    variants: selected.map(variant => ({
      id: variant.id,
      locked: false,
      ...(!summary ? { sections: variant.sections } : {})
    })),
    legacyVariants: summary ? [] : legacyCatalog.variants.filter(variant => ids.has(variant.id))
  };
}
