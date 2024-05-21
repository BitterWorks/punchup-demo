Feature: Privacy and Terms

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        # And I click on 'Sign in / Register'
        # And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        # And I click on 'Get Magic Link'
        # And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        # And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        # Then I am at the 'Personal' feed
    
    Scenario: Validate the appearance of the Privacy and Policy
        When I click on the hamburger menu button
        And I click on 'Privacy & Terms'
        And I click on 'Privacy Policy'
        Then I verify the 'center' section appearance

    Scenario: Validate the appearance of the Terms of Use
        When I click on the hamburger menu button
        And I click on 'Privacy & Terms'
        And I click on 'Terms of Use'
        Then I verify the 'center' section appearance