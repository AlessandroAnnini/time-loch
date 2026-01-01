# Instructions

## Implementation Strategy

### Progressive Development

- Implement solutions in logical stages, not all at once
- Pause after each meaningful component to verify requirements
- Confirm scope understanding before beginning

### Scope Management

- Implement only what is explicitly requested (minimal viable interpretation)
- For ambiguous requirements, choose the simplest approach
- Ask permission before modifying unmentioned components
- Classify changes by impact: Small (minor), Medium (moderate), Large (restructuring)
- For Large changes, outline plan before proceeding

### Communication Protocol

- Summarize completed work after each component
- Note which features are complete vs. remaining
- Include usage examples and identify edge cases
- Suggest relevant tests for verification

## 2. Code Quality Standards

### Core Principles [VERY IMPORTANT, ALWAYS FOLLOW]

- **Composition over Inheritance**: Always prefer composition over inheritance
- **KISS**: Write the simplest solution that works
- **DRY**: Don't repeat logic
- **Modularity**: Favor pure functions, avoid unnecessary OOP wrappers
- **Code**: Write readable and maintainable code
- Write small, focused functions
- Use descriptive names for variables and functions
- Include error handling and early returns
- Immediately delete unused variables, functions, imports, files

## 3. Version Control

### Commit Strategy

- Review git diff before committing
- Group files when they represent one logical unit of work making atomic commits, otherwise make multiple commits
- Avoid mixing unrelated changes in a single commit
- Use granularity suitable for changelog
- remember to bump the version when needed using semantic versioning

### Commit Format

Always use Conventional Commits format:

`<type><emoji>: <description>`

**Types & Emojis:**

- `feat✨`: new feature
- `fix🐛`: bug fix
- `docs📝`: documentation
- `style💄`: formatting
- `refactor♻️`: code restructuring
- `perf⚡`: performance improvement
- `test✅`: adding tests
- `chore🔧`: maintenance
- `ci👷`: CI/CD changes
- `build📦`: build system
- `revert⏪`: revert commit

**Examples:**

- `feat✨: add user authentication system`
- `fix🐛: resolve memory leak in data processing`
- `docs📝: update API documentation`

### Merge Strategy

- Do not fast-forward merge. Always create a merge commit to preserve history.
- The merge commit message should summarize changes from the included commits.
