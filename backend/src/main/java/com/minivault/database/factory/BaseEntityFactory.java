package com.minivault.database.factory;

import com.minivault.interfaces.EntityFactory;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.util.*;
import java.util.function.Supplier;

@RequiredArgsConstructor
public abstract class BaseEntityFactory<T> implements EntityFactory<T> {

    protected final Faker faker = new Faker(new Locale("en-GB"), new Random(123456789L));

    @Getter
    private final JpaRepository<T, ?> repository;

    protected String currentState = null;
    private final Map<String, Supplier<Object>> overrides = new HashMap<>();

    // Override this in concrete factories
    protected abstract T definition();

    @Override
    public EntityFactory<T> state(String stateName) {
        this.currentState = stateName;
        return this;
    }

    @Override
    public EntityFactory<T> with(String key, Object value) {
        overrides.put(key, () -> value);
        return this;
    }

    @Override
    public T make() {
        return applyOverrides(definition());
    }

    @Override
    public List<T> make(int count) {
        return makeMany(count);
    }

    @Override
    @Transactional
    public T create() {
        T entity = make();
        reset();
        return repository.save(entity);
    }

    @Override
    @Transactional
    public List<T> create(int count) {
        List<T> entities = makeMany(count);
        reset();
        return repository.saveAll(entities);
    }

    private List<T> makeMany(int count) {
        List<T> list = new ArrayList<>();
        for (int i = 0; i < Math.max(1, count); i++) {
            list.add(make());
        }
        return list;
    }

    private T applyOverrides(T entity) {
        applyState(entity);

        overrides.forEach((key, supplier) -> {
            try {
                Field field = entity.getClass().getDeclaredField(key);
                field.setAccessible(true);
                field.set(entity, supplier.get());
            } catch (Exception e) {
                throw new RuntimeException("Failed to set field: " + key, e);
            }
        });

        return entity;
    }

    protected void applyState(T entity) {
        // override in child
    }

    private void reset() {
        this.overrides.clear();
        this.currentState = null;
    }
}