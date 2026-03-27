package com.minivault.util;

public class SlugUtils {
    public static String toSlug(String input) {
        if (input == null) return "";

        return input
                .toLowerCase()                          // "Acme Corp!" → "acme corp!"
                .trim()                                  // remove leading/trailing spaces
                .replaceAll("[^a-z0-9\\s-]", "")        // remove special chars → "acme corp"
                .replaceAll("\\s+", "-")                 // spaces to hyphens → "acme-corp"
                .replaceAll("-+", "-")                   // collapse multiple hyphens → "acme-corp"
                .replaceAll("^-|-$", "");               // remove leading/trailing hyphens
    }
}
