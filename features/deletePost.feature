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
        When I hover over the first post
        And I click on the 'threeDots' icon
        And I click on 'Delete Post'
        And I click on 'Delete'
        And refresh
        Then I don't see a post with 'test post' title

    Scenario: Delete specific post
        When pause
        And I hover over the post titled 'test post test random text'
        And pause
        And I click on the 'threeDots' icon
        And I click on 'Delete Post'
        And I click on 'Delete'
        And refresh
        Then I don't see a post with 'test post test random text' title