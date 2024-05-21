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
        When I click on 'Create'
        And I click on 'Community'
        And I input 'test a' under 'Name'
        And I input 'test-a-community' under 'Slug'
        And I click on 'Pick a Nice Emoji'
        And I click on the '🤯' emoji
        And I click on 'Create Community'
        And refresh
        Then I see the 'All test a' community

    Scenario: With Member Nickname (Singular)
        When I click on 'Create'
        And I click on 'Community'
        And I input 'test1 a' under 'Name'
        And I input 'test-a-community1' under 'Slug'
        And I click on 'Pick a Nice Emoji'
        And I click on the '☠️' emoji
        And I input 'Tester' under 'Member Nickname (Singular)'
        And I click on 'Create Community'
        And refresh
        Then I see the 'All test1 a' community

    Scenario: With Members Nickname (Plural)
        When I click on 'Create'
        And I click on 'Community'
        And I input 'test2 a' under 'Name'
        And I input 'test-a-community2' under 'Slug'
        And I click on 'Pick a Nice Emoji'
        And I click on the '🤥' emoji
        And I input 'Testers' under 'Members Nickname (Plural)'
        And I click on 'Create Community'
        And refresh
        Then I see the 'All test2 a' community

    Scenario: With Description
        When I click on 'Create'
        And I click on 'Community'
        And I input 'test3 a' under 'Name'
        And I input 'test-a-community3' under 'Slug'
        And I click on 'Pick a Nice Emoji'
        And I click on the '🦿' emoji
        And I input 'test community Description' under 'Description'
        And I click on 'Create Community'
        And refresh
        Then I see the 'All test3 a' community