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
        When I click on 'Create'
        And I click on 'Feed'
        And I input 'test without tagline' under 'Name'
        And I click on 'Pick a Nice Emoji'
        And I click on the '🤭' emoji
        And I click on 'Create Feed'
        Then I see the 'test without tagline' feed

    Scenario: With tagline
        When I click on 'Create'
        And I click on 'Feed'
        And I input 'test with tagline 6' under 'Name'
        And I click on 'Pick a Nice Emoji'
        And I click on the '😱' emoji
        And I input 'tagline example 6' under 'Tagline'
        And I click on 'Create Feed'
        And I click on the 'test with tagline 6' feed
        Then I see 'tagline example 6' under 'test with tagline 6'