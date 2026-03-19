package com.minivault.annotation;

import com.minivault.enums.AuditAction;
import com.minivault.enums.AuditResource;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {
    AuditAction action();
    AuditResource resource();
    String descriptionTemplate() default ""; // e.g. "Created secret {key}"
}