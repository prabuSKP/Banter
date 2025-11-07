# Serena MCP Server - Usage Guide for Banter Project

## Overview
Serena is now configured globally on your PC and available to all projects. This guide shows you how to use Serena's powerful code analysis tools with your Banter project.

## Available Serena Tools

### 1. **list_dir** - Browse Project Structure
List files and directories with intelligent filtering.

**Example Usage:**
```
Can you use Serena to list all TypeScript files in the backend/src directory?
```

**What it does:**
- Lists files and directories recursively
- Filters by file types
- Shows project structure intelligently

---

### 2. **find_symbol** - Find Functions, Classes, Variables
Search for any symbol (function, class, interface, etc.) across your entire codebase.

**Example Usage:**
```
Use Serena to find all occurrences of the "authenticateToken" function
Use Serena to find the User interface definition
Find all controller classes in the backend
```

**What it does:**
- Finds function definitions
- Locates class declarations
- Searches for interfaces, types, variables
- Works across multiple languages (TypeScript, JavaScript, etc.)

---

### 3. **get_symbols_overview** - Analyze File Contents
Get a detailed overview of all symbols (functions, classes, methods) in a specific file.

**Example Usage:**
```
Use Serena to show me all functions in backend/src/controllers/auth.controller.ts
Get an overview of all exports from backend/src/services/user.service.ts
```

**What it does:**
- Lists all functions, classes, and exports in a file
- Shows method signatures
- Displays symbol types and definitions

---

### 4. **search_for_pattern** - Semantic Code Search
Search for code patterns semantically, not just text matching.

**Example Usage:**
```
Use Serena to find all API endpoints that handle authentication
Search for all database queries related to messages
Find error handling patterns in the codebase
```

**What it does:**
- Semantic search (understands code context)
- Finds patterns across multiple files
- More intelligent than grep/text search

---

### 5. **find_referencing_symbols** - Find Usage/References
Find where a symbol is being used/referenced throughout the codebase.

**Example Usage:**
```
Use Serena to find all places where the authenticateToken middleware is used
Show me where the User model is imported and used
```

**What it does:**
- Finds all references to a function/class
- Shows import statements
- Displays usage locations

---

### 6. **write_memory** - Store Project Context
Store important information about your project for future reference.

**Example Usage:**
```
Use Serena to remember that we're using Firebase for authentication
Store a memory that the API base URL is configurable via environment variables
```

**What it does:**
- Stores project-specific context
- Helps maintain conversation continuity
- Remembers important decisions and patterns

---

## Real-World Examples for Banter Project

### Example 1: Understanding Authentication Flow
```
Use Serena to:
1. Find the authenticateToken middleware function
2. Show me all API endpoints that use this middleware
3. Get an overview of the auth.controller.ts file
```

### Example 2: Analyzing Message System
```
Use Serena to:
1. Find all symbols related to "message" in the backend
2. Show me the message.service.ts file structure
3. Find where Socket.IO is used for real-time messaging
```

### Example 3: Database Schema Analysis
```
Use Serena to:
1. Find the Prisma schema file
2. Show me all models defined in the schema
3. Find all places where the User model is queried
```

### Example 4: API Endpoint Discovery
```
Use Serena to:
1. List all route files in backend/src/routes
2. Find all Express router definitions
3. Show me the structure of the friend.routes.ts file
```

### Example 5: Error Handling Audit
```
Use Serena to:
1. Search for all try-catch blocks in controllers
2. Find error handling middleware
3. Locate all places where logger is used
```

---

## Tips for Using Serena Effectively

1. **Be Specific**: Instead of "find User", say "find the User interface definition"
2. **Use Context**: Mention file paths or directories when you know them
3. **Chain Commands**: Ask for multiple analyses in sequence for deeper insights
4. **Store Memories**: Use write_memory for important project decisions
5. **Explore Structure First**: Start with list_dir to understand the codebase layout

---

## Common Workflows

### Debugging Workflow
```
1. Find the function with the bug
2. Get all references to that function
3. Analyze related files for context
4. Search for similar patterns
```

### Feature Implementation Workflow
```
1. Search for similar existing features
2. Find relevant models and services
3. Locate route handlers
4. Understand the pattern and replicate
```

### Code Review Workflow
```
1. Get symbols overview of modified files
2. Find all references to changed functions
3. Search for potential side effects
4. Verify error handling patterns
```

---

## Serena vs Traditional Tools

| Task | Traditional | Serena |
|------|-------------|--------|
| Find function | `grep -r "function name"` | Understands code semantically |
| List files | `find . -name "*.ts"` | Intelligent filtering |
| Find references | Manual search | Automatic reference tracking |
| Code patterns | Text search | Semantic understanding |
| Project context | Documentation | Built-in memory system |

---

## Next Steps

1. **Restart Claude Code** to activate Serena
2. **Try a simple command**: "Use Serena to list the backend/src directory"
3. **Explore your codebase**: Start with finding key symbols in your controllers
4. **Store context**: Write memories about your project architecture

---

## Troubleshooting

If Serena tools aren't working:
1. Ensure you've restarted Claude Code
2. Check that the config exists: `C:\ProgramData\ClaudeCode\managed-mcp.json`
3. Verify uvx is installed: Run `uvx --version`
4. Try running `/mcp` command in Claude Code to see if Serena is listed

---

## Additional Resources

- Serena GitHub: https://github.com/oraios/serena
- MCP Documentation: https://docs.claude.com/en/docs/claude-code/mcp
- Serena MCP Tools: All tools prefixed with `mcp__serena__`

---

**Remember**: Serena is now available globally across all your projects! You can use it in:
- W:\Application\Banter (current project)
- C:\Prabu\Application\HomeFood-Delivery
- Any other projects you work on

Happy coding with Serena! 🚀
