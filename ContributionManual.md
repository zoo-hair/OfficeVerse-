# OfficeVerse Contribution Manual

Thank you for your interest in contributing to OfficeVerse! We welcome contributions to both the frontend and backend components.

## Workflow

1.  **Fork the Repository**
    Create a fork of the project to your own GitHub account.

2.  **Create a Branch**
    Create a new branch for your feature or bugfix:
    ```bash
    git checkout -b feature/your-feature-name
    ```

3.  **Make Changes**
    Follow the coding standards outlined below.

4.  **Test Your Changes**
    Ensure that the application runs correctly locally.
    - **Backend**: `./gradlew test` (if tests are available) or `./gradlew build`
    - **Frontend**: `npm run build` to verify no build errors.

5.  **Commit and Push**
    ```bash
    git commit -m "feat: description of your changes"
    git push origin feature/your-feature-name
    ```

6.  **Submit a Pull Request**
    Open a Pull Request (PR) to the `main` branch of the original repository.

## Coding Standards

### Backend (Java/Spring Boot)
- **Style**: Follow standard Java naming conventions (CamelCase for classes, camelCase for methods/variables).
- **Structure**: Place new features in appropriate packages under `com.offficeVerse`.
- **Validation**: Ensure that any new API endpoints validate input correctly.
- **Dependency Management**: Add new dependencies to `build.gradle` only if necessary.

### Frontend (JavaScript/Phaser)
- **Style**: Use Modern JavaScript (ES Modules).
- **Linting**: If you have ESLint installed, ensure no errors are present.
- **Assets**: Place new images in `public/assets/` and reference them correctly in scenes.
- **Components**: Keep UI logic separate from Game Scene logic where possible (e.g., in `src/game/ui/`).

## Project Structure Overview

- **`officeVerse_server`**: The Spring Boot backend.
  - Run with: `./gradlew bootRun`
- **`officeVerse_client`**: The Phaser 3 frontend.
  - Run with: `npm run dev`

## Reporting Issues
If you find a bug, please open an issue in the repository with:
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## License
By contributing, you agree that your contributions will be licensed under the project's existing license.
