# System Patterns

## Architecture Overview

The project follows Clean Architecture principles with clear separation of concerns:

```
src/
├── domain/          # Business logic and entities
├── data/            # Data layer (repositories, use cases)
├── infra/           # Infrastructure (filesystem implementation)
├── presentation/     # Controllers and request/response handling
├── main/            # Application setup and configuration
└── validators/      # Validation logic
```

## Key Technical Decisions

### 1. Clean Architecture Layers

- **Domain**: Core entities (`Project`, `File`) and use case interfaces
- **Data**: Repository protocols and use case implementations
- **Infrastructure**: Filesystem repository implementations
- **Presentation**: MCP protocol controllers and request/response handling

### 2. Use Case Pattern

Each operation is implemented as a use case:
- `ListProjectsUseCase`
- `ListProjectFilesUseCase`
- `ReadFileUseCase`
- `WriteFileUseCase`
- `UpdateFileUseCase`

### 3. Repository Pattern

- `ProjectRepository`: Manages project-level operations
- `FileRepository`: Manages file-level operations within projects

### 4. Controller Pattern

Each MCP tool has a dedicated controller:
- Handles request validation
- Executes use cases
- Formats responses
- Handles errors

### 5. Validation Strategy

Composite validator pattern:
- `ValidatorComposite`: Chains multiple validators
- `RequiredFieldValidator`: Ensures required fields
- `PathSecurityValidator`: Prevents path traversal
- `ParamNameValidator`: Validates parameter names

## Component Relationships

```
MCP Request
    ↓
Controller (validates request)
    ↓
Use Case (business logic)
    ↓
Repository (data access)
    ↓
File System
```

## Critical Implementation Paths

### File Read Flow
1. MCP tool receives read request
2. Controller validates project and file path
3. Use case executes read operation
4. Repository reads from filesystem
5. Response returned to MCP client

### File Write Flow
1. MCP tool receives write request
2. Controller validates all required fields
3. Path security validation prevents traversal
4. Use case executes write operation
5. Repository writes to filesystem
6. Success response returned

## Design Patterns in Use

- **Factory Pattern**: `main/factories/` creates controllers and use cases
- **Repository Pattern**: Abstracts data access
- **Use Case Pattern**: Encapsulates business logic
- **Composite Pattern**: Validator composition
- **Strategy Pattern**: Different validators for different rules
