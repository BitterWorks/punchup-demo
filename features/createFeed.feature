Feature: Create Feed

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    @smoke
    Scenario: Without tagline
        And I click on 'Create'
        And pause
        And I click on 'Feed'
        And pause
        And I input 'test' under 'Your Feed'
        And pause
        And I click on 'Create Feed'
        And pause
        # Then I see the '' Feed

    Scenario: With tagline
        And I click on 'Create'
        And pause
        And I click on 'Feed'
        And pause
        And I input 'test' under 'Your Feed'
        And pause
        And I input 'tagline' under 'Brevity is the soul of wit'
        And pause
        And I click on 'Create Feed'
        And pause