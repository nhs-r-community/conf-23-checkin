# NHS-R Conference 2023 Check In App <a alt="NHS-R Community's logo" href='https://nhsrcommunity.com/'><img src='https://nhs-r-community.github.io/assets/logo/nhsr-logo.svg' align="right" height="80" /></a>


This is an app to be used by the event organising team to check users into the conference.
It is split into two separate components:

- the frontend is built in [React](https://react.dev/)
- the backend is a [{plumber}](https://www.rplumber.io/) API

both of these are deployed to a [Posit Connect server](https://posit.co/products/enterprise/connect/).

Each attendee to the conference is assigned a [Version 4 UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)), and a QR code is generated and emailed to the attendees.

At the conference, the event team are able to use this app to scan the QR codes, or search manually by name/email, to check attendees into the conference
