package com.minivault.interfaces;

import java.util.List;

public interface EntityFactory<T> {

    T make();                    // Creates one instance (in memory)
    List<T> make(int count);     // Creates multiple instances

    T create();                  // Creates + saves to DB
    List<T> create(int count);   // Creates + saves multiple

    // Fluent overrides (like Laravel states)
    EntityFactory<T> state(String stateName);   // e.g., "verified", "admin"
    EntityFactory<T> with(String key, Object value); // Override specific field
}
