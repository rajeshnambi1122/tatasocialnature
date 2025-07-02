# Halwa City Marathon (TP Marathon)

This is the official web application for the **Halwa City Marathon 2025** (TP Marathon), a grand nature festival and marathon event held in Tirunelveli, Tamil Nadu, to celebrate World Environment Day. The event is organized by the Social and Nature Conservation Trust (SANCT) and Sponsored by TP Solar Limited, a Tata Enterprise. The webiste provides information, registration, and engagement for participants and the community.

## Project Overview
- **Purpose:** Raise awareness for environmental protection, especially the Thamirabarani River, and promote a greener Tirunelveli through a city-wide marathon and related events.
- **Audience:** Runners, students, families, and the general public interested in participating or learning about the event.
- **Tech Stack:** Angular 19, RxJS, TypeScript, SCSS/CSS, i18n (English/Tamil)

## Main Features
- **Event Information:** Details about the marathon, its route, and the cause.
- **Online Registration:** Easy registration for various event categories (Marathon, Walkathon, Drawing/Poetry competitions, etc.).
- **Gallery:** Photo carousel showcasing past and present marathon moments.
- **Rules & Medical Info:** Guidelines for participants and available medical facilities.
- **About Tirunelveli:** Highlights of the city's heritage and landmarks.
- **Partners Section:** Acknowledgement of sponsors and partners.
- **Multilingual Support:** English and Tamil language toggle.
- **Admin Dashboard:** (Under `/admin`) For event organizers to manage registrations and participants (login required).

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Angular CLI](https://angular.io/cli) (v19+)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd socialnature
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server
To start a local development server, run:
```bash
ng serve
```
Open your browser at [http://localhost:4200/](http://localhost:4200/).

### Building for Production
To build the project:
```bash
ng build
```
The build artifacts will be stored in the `dist/` directory.

### Running Tests
- **Unit tests:**
  ```bash
  ng test
  ```
- **End-to-end tests:**
  ```bash
  ng e2e
  ```

## Project Structure
- `src/app/home/` – Main landing page and event info
- `src/app/application-register/` – Registration form
- `src/app/marathon-route/` – Route details
- `src/app/admin/` – Admin dashboard and login
- `src/assets/i18n/` – Language files (English/Tamil)
- `public/images/` – Event and gallery images

## Credits
- **Organized by:** Social and Nature Conservation Trust (SANCT)
- **Sponsored:** TP Solar Limited, a Tata Enterprise
- **Design & Development:** rajeshnambi1122

---

*This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.10. For more Angular CLI commands and help, see the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).*
