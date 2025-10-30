# Conference Check In App <a alt="NHS-R Community's logo" href='https://nhsrcommunity.com/'><img src='https://nhs-r-community.github.io/assets/logo/nhsr-logo.svg' align="right" height="80" /></a>


This is an app to be used by the event organising team to check users into the conference.
It is split into two separate components:

- the frontend is built in [React](https://react.dev/) (JavaScript)
- the backend is a [`{plumber}`](https://www.rplumber.io/) API (R)

both of these are deployed to a [Posit Connect server](https://posit.co/products/enterprise/connect/).

Each attendee to the conference is assigned a [Version 4 UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)), and a QR code is generated and emailed to the attendees.

At the conference, the event team are able to use this app to scan the QR codes, or search manually by name/email, to check attendees into the conference

The app uses websockets, so the attendees list can be automatically updated on all of the users devices when someone checks an attendee in.
This is not yet an officially supported feature of `{plumber}`, though there are workarounds in an [issue](https://github.com/rstudio/plumber/issues/723) which have been used here.

Originally created for the 2023 NHS-R Conference, and then adapted for [RPYSOC 2025](hhttps://nhsrcommunity.com/conference.html).

## Uploading attendees list via an excel file

The API supports uploading an excel file with multiple sheets, one for each day of the conference.

Each sheet should have the following columns:

- firstname,
- surname,
- email,
- type (one of: Attendee, Speaker, Organizer, Sponsor).

The sheets should be named with the date of the conference day, e.g. "2025-11-13", "2025-11-14".