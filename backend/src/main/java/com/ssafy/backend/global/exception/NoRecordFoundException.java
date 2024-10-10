package com.ssafy.backend.global.exception;

public class NoRecordFoundException extends RuntimeException {
    public NoRecordFoundException(String message) {
        super(message);
    }
}
