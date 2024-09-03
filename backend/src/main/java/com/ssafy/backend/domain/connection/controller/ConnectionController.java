package com.ssafy.backend.domain.connection.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/connect")
public class ConnectionController {

    @GetMapping("/test")
    public String test() {
        return "test";
    }
}