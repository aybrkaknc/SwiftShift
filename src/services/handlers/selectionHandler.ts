/**
 * Selection Handler
 * Utilities for processing text selections.
 */

export const SelectionHandler = {
    /**
     * Clean up selected text
     * Removes excessive whitespace, trims.
     */
    processText(text: string): string | null {
        if (!text) return null;

        const clean = text.trim();
        if (clean.length === 0) return null;

        return clean;
    },

    /**
     * Get current selection from window
     */
    getSelection(): string | null {
        const selection = window.getSelection();
        if (!selection) return null;
        return this.processText(selection.toString());
    }
};
