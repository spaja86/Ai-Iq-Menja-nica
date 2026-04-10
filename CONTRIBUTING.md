# Contributing to Ai IQ Menjačnica

Thank you for your interest in contributing to the Ai IQ Menjačnica exchange platform!

## Development Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 16 or SQLite
- Redis 7
- Docker & Docker Compose (optional)

### Local Development

```bash
# Clone repository
git clone https://github.com/spaja86/Ai-Iq-Menja-nica.git
cd Ai-Iq-Menja-nica

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set up environment
cp ../.env.example ../.env
# Edit .env with development settings

# Run tests
pytest tests/ -v

# Start development server
uvicorn app.main:app --reload
```

## Code Standards

### Python Style
- Follow PEP 8
- Use Black for code formatting
- Maximum line length: 100 characters
- Use type hints

```bash
# Format code
black app/

# Check linting
flake8 app/
```

### Database
- Use Alembic for migrations
- Always include foreign key constraints
- Add indexes for frequently queried columns
- Use transactions for multi-step operations

### API Design
- Follow REST principles
- Use appropriate HTTP methods
- Return proper status codes
- Include comprehensive error messages
- Document all endpoints

### Security
- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Sanitize database queries
- Log security-relevant actions

## Git Workflow

### Branch Naming
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation

### Commit Messages
```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Example:
```
feat: Add 2FA authentication support

Implemented TOTP-based two-factor authentication using pyotp.
Users can now enable 2FA from their account settings.

Closes #123
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make Changes**
   - Write clean, documented code
   - Add tests for new features
   - Update documentation

3. **Test Thoroughly**
   ```bash
   pytest tests/ -v
   black app/
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature
   ```
   - Create pull request on GitHub
   - Link related issues
   - Provide clear description
   - Request review

6. **Code Review**
   - Address reviewer feedback
   - Update as needed
   - Maintain professional communication

## Testing

### Test Structure
```
backend/tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── api/            # API endpoint tests
└── conftest.py     # Pytest fixtures
```

### Writing Tests
```python
# test_auth.py
def test_register_user(client, db):
    """Test user registration"""
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "SecurePass123!"
    })
    assert response.status_code == 201
    assert "id" in response.json()
```

### Running Tests
```bash
# All tests
pytest tests/ -v

# Specific test file
pytest tests/unit/test_auth.py -v

# With coverage
pytest --cov=app tests/

# Watch mode
pytest-watch
```

## Database Migrations

### Creating Migrations
```bash
# Auto-generate migration
alembic revision --autogenerate -m "Add user table"

# Manual migration
alembic revision -m "Add custom index"
```

### Applying Migrations
```bash
# Apply all
alembic upgrade head

# Apply specific
alembic upgrade +1

# Rollback
alembic downgrade -1
```

## Documentation

### Code Documentation
- Use docstrings for all functions and classes
- Follow Google or NumPy docstring style
- Include parameter types and return values

```python
def create_order(user_id: int, market_id: int, quantity: float) -> Order:
    """
    Create a new trading order.
    
    Args:
        user_id: ID of the user placing the order
        market_id: ID of the market to trade on
        quantity: Amount to buy/sell
    
    Returns:
        Created Order object
    
    Raises:
        ValueError: If quantity is invalid
        InsufficientFundsError: If user has insufficient balance
    """
    ...
```

### API Documentation
- Update OpenAPI/Swagger docs
- Include request/response examples
- Document error responses
- Add usage notes

## Performance

### Guidelines
- Use database indexes appropriately
- Implement caching for frequent queries
- Use async operations where beneficial
- Profile slow endpoints
- Optimize database queries

### Monitoring
- Add logging for important operations
- Use proper log levels
- Include request IDs for tracing
- Monitor error rates

## Security Guidelines

### Authentication
- Always verify user permissions
- Use JWT for API authentication
- Implement proper token expiration
- Support 2FA

### Input Validation
- Validate all user inputs
- Use Pydantic schemas
- Sanitize database queries
- Prevent injection attacks

### Sensitive Data
- Never log passwords or tokens
- Use environment variables for secrets
- Encrypt sensitive data at rest
- Use HTTPS in production

## Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No console.log or debug code
- [ ] No commented-out code
- [ ] Error handling implemented
- [ ] Security considerations addressed
- [ ] Performance impact considered
- [ ] Database migrations included (if needed)
- [ ] Backward compatibility maintained

## Questions?

- Open an issue for bugs
- Start a discussion for questions
- Email: spajicn@yahoo.com

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Ai IQ Menjačnica! 🚀
