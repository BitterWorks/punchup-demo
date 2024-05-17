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
        And I click on 'Feed'
        And pause
        And I input 'test no tagline' under 'Name'
        And pause
        And I click on 'Pick a Nice Emoji'
        And I click on the '🤩' emoji
        And I click on 'Create Feed'
        And pause
        Then I see the 'test' Feed

    Scenario: With tagline
        And I click on 'Create'
        And pause
        And I click on 'Feed'
        And pause
        And I input 'test with tagline' under 'Name'
        And pause
        And I click on 'Pick a Nice Emoji'
        And I click on the '🤩' emoji
        And pause
        And I input 'tagline example' under 'Tagline'
        And pause
        And I click on 'Create Feed'
        And pause
        And I hover over the 'test tagline' feed
        And pause
        And I click on the 'test with tagline' channel
        And pause
        Then I see 'tagline example' under 'Tagline'