Feature: Smoke Suite

    Set of tests with happiest of happy paths for all core features

    Background:
        Given I go to the '/' page
    
    Scenario: Valid login w/ exiting email using Magic Link
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    Scenario: Valid signup w/ Magic Link
        And I click on 'Sign in / Register'
        And I input a valid 'email' under 'Email'
        And I save the value for the 'Email' input as 'signup-email'
        And I click on 'Get Magic Link'
        And I wait for the email saved as "signup-email" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to the email saved as "signup-email"
        Then I am at the 'Personal' feed

    Scenario: Create a text-only post
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        And pause
        And I click on "Create"
        And I click on "Post"
        And I input 'This is my post' under 'Title'
        And pause
        And I click on 'Publish'
        And pause
        Then I see a toast message saying "You published a post to..."

    Scenario: Open and close Search bar
        When I click on the 'lens' icon
        When I click on the 'x' icon
        Then I no longer see the search bar

    Scenario: Validate the appearance of the Privacy and Policy
        When I click on the three-dot-option button
        When I click on 'Privacy & Terms'
        When I click on 'Privacy Policy'
        Then I verify the 'center' section appearance

    Scenario: Access the New Movies Feed
        When I click on the three-dot-option button
        When I click on 'Discover Feeds'
        When I click on 'New Movies'
        Then I see the 'New Movies' title

    