Feature: Delete Post

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    @smoke
    Scenario: Delete first post
        And pause
        And I hover over the first post
        And pause
        And I click on the 'threeDots' icon
        And pause
        And I click on 'Delete Post'
        And pause
        And I click on 'Delete'
        And pause