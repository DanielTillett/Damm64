# End-to-end tests for the damm64 command-line tool.
# Run via ctest; expects -DDAMM64=<path to executable>.

function(expect_run expected_status expected_output)
    execute_process(
        COMMAND ${DAMM64} ${ARGN}
        RESULT_VARIABLE status
        OUTPUT_VARIABLE output
        ERROR_QUIET)
    string(REPLACE "\r" "" output "${output}")
    if(NOT status EQUAL expected_status)
        message(FATAL_ERROR "damm64 ${ARGN}: exit ${status}, expected ${expected_status}")
    endif()
    if(NOT "${expected_output}" STREQUAL "<any>" AND NOT output STREQUAL "${expected_output}")
        message(FATAL_ERROR "damm64 ${ARGN}: got\n${output}\nexpected\n${expected_output}")
    endif()
endfunction()

expect_run(0 "Base64 Number: Hello\nBase64 Check Digit: p\nError Check: 0\n" Hello)
expect_run(0 "Base64 Number: Hellop\nBase64 Check Digit: A\nError Check: 1\n" Hellop)
expect_run(0 "Hellop\n" -a Hello)
expect_run(0 "" -c Hellop)
expect_run(1 "" -c Hellop Hellpp)
expect_run(0 "<any>" -a -- -leading-dash)
expect_run(1 "<any>" -a bad=char)
expect_run(1 "Base64 Number: bad=char\nBase64 Check Digit: invalid character\nError Check: 0\n" bad=char)
expect_run(2 "<any>" --bogus)
expect_run(0 "<any>" --help)
