cmake_minimum_required(VERSION 3.16)

project(damm64
    VERSION 1.0.0
    DESCRIPTION "Base64 implementation of the Damm check digit algorithm"
    LANGUAGES C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

if(MSVC)
    set(DAMM64_WARNINGS /W4)
else()
    set(DAMM64_WARNINGS -Wall -Wextra -Wpedantic -Wconversion -Wshadow)
endif()

add_library(damm64lib src/damm64.c)
target_include_directories(damm64lib PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>)
target_compile_options(damm64lib PRIVATE ${DAMM64_WARNINGS})
set_target_properties(damm64lib PROPERTIES OUTPUT_NAME damm64)

add_executable(damm64 src/main.c)
target_link_libraries(damm64 PRIVATE damm64lib)
target_compile_options(damm64 PRIVATE ${DAMM64_WARNINGS})
target_compile_definitions(damm64 PRIVATE DAMM64_VERSION="${PROJECT_VERSION}")

include(GNUInstallDirs)
install(TARGETS damm64 damm64lib)
install(FILES include/damm64.h DESTINATION ${CMAKE_INSTALL_INCLUDEDIR})

include(CTest)
if(BUILD_TESTING)
    add_executable(test_damm64 tests/test_damm64.c)
    target_link_libraries(test_damm64 PRIVATE damm64lib)
    target_compile_options(test_damm64 PRIVATE ${DAMM64_WARNINGS})
    add_test(NAME unit COMMAND test_damm64 ${CMAKE_CURRENT_SOURCE_DIR}/tests/vectors.txt)
    add_test(NAME cli
        COMMAND ${CMAKE_COMMAND} -DDAMM64=$<TARGET_FILE:damm64>
                -P ${CMAKE_CURRENT_SOURCE_DIR}/tests/test_cli.cmake)
endif()
