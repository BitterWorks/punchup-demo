Feature: Smoke Suite

    Set of tests with happiest of happy paths for all core features

    Scenario: Valid login w/ exiting email using Magic Link
        When I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    Scenario: Valid signup w/ Magic Link
        When I go to the '/' page
        And I click on 'Sign in / Register'
        And I input a valid 'email' under 'Email'
        And I save the value for the 'Email' input as 'signup-email'
        And I click on 'Get Magic Link'
        And I wait for the email saved as "signup-email" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to the email saved as "signup-email"
        Then I am at the 'Personal' feed

    Scenario: Create a post
        When I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        And I click on "Create"
        And I click on "Post"
        And I input 'This is my post' under 'Title'
        And I click on 'Publish'
        Then I see a toast message saying "You published a post to..."
