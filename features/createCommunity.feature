Feature: Create Community

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    Scenario: Without Member Nickname
        And I click on 'Create'
        And I click on 'Community'
        And I input 'test' under 'Name'
        And I input 'test-community' under 'Slug'
        And I click on 'Pick a Nice Emoji'
        And I click on the '🤠' emoji
        And I click on 'Create Community'
        Then I see the 'All test' community

    Scenario: With Member Nickname (Singular)
        And I click on 'Create'
        And I click on 'Community'
        And I input 'test1' under 'Name'
        And I input 'test-community1' under 'Slug'
        And I click on 'Pick a Nice Emoji'
        And I click on the '🤠' emoji
        And I input 'Tester' under 'Member Nickname (Singular)'
        And I click on 'Create Community'
        Then I see the 'All test1' community

    Scenario: With Members Nickname (Plural)
        And I click on 'Create'
        And I click on 'Community'
        And I input 'test2' under 'Name'
        And I input 'test-community2' under 'Slug'
        And I click on 'Pick a Nice Emoji'
        And I click on the '🤠' emoji
        And I input 'Testers' under 'Members Nickname (Plural)'
        And I click on 'Create Community'
        Then I see the 'All test2' community

    Scenario: With Description
        And I click on 'Create'
        And I click on 'Community'
        And I input 'test3' under 'Name'
        And I input 'test-community3' under 'Slug'
        And I click on 'Pick a Nice Emoji'
        And I click on the '🤠' emoji
        And I input 'test community Description' under 'Description'
        And I click on 'Create Community'
        Then I see the 'All test3' community