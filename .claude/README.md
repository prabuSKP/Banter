# 🤖 Banter Subagent System

A comprehensive multi-agent architecture designed specifically for the **Banter** social voice/video chat application. This system consists of specialized AI agents working together under a master orchestrator to coordinate all aspects of development, from backend APIs to mobile UI/UX.

## 📋 Overview

The Banter Subagent System is designed to:
- **Coordinate complex development tasks** across multiple technology stacks
- **Ensure code quality and consistency** through specialized expertise
- **Accelerate development velocity** through parallel work streams
- **Maintain architectural integrity** with centralized oversight
- **Optimize for social chat app requirements** with domain-specific knowledge

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Master Orchestrator                       │
│                (banter-master-orchestrator)                  │
│  • Project coordination & technical leadership              │
│  • Architecture decisions & quality assurance               │
│  • Agent delegation & dependency management                │
│  • Integration management & deployment coordination          │
└─────────────┬───────────────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │   Specialized    │
    │    Agents        │
    └─────────┬─────────┘
              │
    ┌─────────┴─────────┐
    │  Domain Experts  │
    └───────────────────┘
```

## 🎭 Specialized Agents

### 🔧 Backend Developer
- **Expertise**: Node.js, Express, TypeScript, Prisma, Socket.IO
- **Responsibilities**: API development, database operations, real-time features
- **Key Files**: `backend/src/**/*.ts`, `backend/prisma/schema.prisma`

### 📱 Mobile Developer
- **Expertise**: React Native, Expo, TypeScript, Firebase, Agora
- **Responsibilities**: Mobile UI/UX, navigation, device-specific features
- **Key Files**: `mobile/app/**/*.tsx`, `mobile/src/**/*.{ts,tsx}`

### 🗄️ Database Specialist
- **Expertise**: PostgreSQL, Prisma ORM, Redis, query optimization
- **Responsibilities**: Schema design, migrations, performance optimization
- **Key Files**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/**/*`

### 📞 RTC Specialist
- **Expertise**: Agora.io, Socket.IO, WebRTC, real-time communication
- **Responsibilities**: Voice/video calling, real-time messaging, call quality
- **Key Files**: `backend/src/services/agora.service.ts`, `mobile/hooks/useAgora.ts`

### 🔐 Auth & Security Specialist
- **Expertise**: Firebase Auth, JWT, security best practices, OWASP
- **Responsibilities**: Authentication flows, security implementation, privacy compliance
- **Key Files**: `backend/src/config/firebase.ts`, `backend/src/middleware/auth.ts`

### 💳 Payment Specialist
- **Expertise**: Razorpay, UPI, subscription management, PCI DSS
- **Responsibilities**: Payment integration, wallet system, transaction security
- **Key Files**: `backend/src/services/payment.service.ts`, `mobile/hooks/usePayment.ts`

### ☁️ Infrastructure Specialist
- **Expertise**: Azure, Docker, CI/CD, monitoring, DevOps
- **Responsibilities**: Cloud deployment, infrastructure automation, scaling
- **Key Files**: `.github/workflows/**/*`, `infrastructure/**/*`

### 🎨 UI/UX Designer
- **Expertise**: React Native Paper, design systems, accessibility, animations
- **Responsibilities**: Component design, user experience, theme systems
- **Key Files**: `mobile/components/**/*.tsx`, `mobile/src/constants/theme.ts`

### 🧪 Testing & QA Specialist
- **Expertise**: Jest, React Native Testing Library, E2E testing, quality assurance
- **Responsibilities**: Test strategy, automation, quality metrics, bug tracking
- **Key Files**: `backend/tests/**/*.ts`, `mobile/tests/**/*.{ts,tsx}`

### 📚 API Documentation Specialist
- **Expertise**: OpenAPI, technical writing, developer experience, documentation automation
- **Responsibilities**: API documentation, developer guides, architecture documentation
- **Key Files**: `docs/api/**/*`, `README.md`, `backend/docs/api.yaml`

## 🔄 Workflows

### Feature Development Workflow
1. **Orchestrator** analyzes requirements and creates task breakdown
2. **Backend Developer** implements API endpoints
3. **Mobile Developer** implements UI components
4. **Database Specialist** updates schema if needed
5. **Testing Specialist** writes and runs tests
6. **Documentation Specialist** updates documentation
7. **Orchestrator** reviews and integrates changes

### Bug Fixing Workflow
1. **Orchestrator** analyzes bug report and identifies affected components
2. **Testing Specialist** reproduces bug with tests
3. **Relevant Specialist** fixes the bug
4. **Testing Specialist** verifies fix with tests
5. **Documentation Specialist** updates changelog
6. **Orchestrator** reviews and deploys fix

### Security Audit Workflow
1. **Auth Security Specialist** conducts security audit
2. **Backend Developer** implements security patches
3. **Mobile Developer** updates mobile security measures
4. **Testing Specialist** tests security implementations
5. **Orchestrator** reviews security improvements

## 📁 File Structure

```
claude/
├── README.md                              # This file
├── subagents.yaml                         # Main subagent configuration
├── orchestrator.yaml                      # Master orchestrator configuration
└── agents/                               # Individual agent configurations
    ├── backend-developer.yaml
    ├── mobile-developer.yaml
    ├── database-specialist.yaml
    ├── rtc-specialist.yaml
    ├── auth-security-specialist.yaml
    ├── payment-specialist.yaml
    ├── infrastructure-specialist.yaml
    ├── ui-ux-designer.yaml
    ├── testing-qa-specialist.yaml
    └── api-documentation-specialist.yaml
```

## 🚀 Getting Started

### Using the Subagent System

1. **Load the Configuration**
   ```bash
   # Load the subagent system
   claude load claude/subagents.yaml
   ```

2. **Task Delegation**
   - The master orchestrator automatically delegates tasks to appropriate specialists
   - Agents collaborate based on dependencies and context sharing rules
   - Progress is tracked through the orchestrator's monitoring system

3. **Agent Interaction**
   - Agents communicate through defined protocols and handoff procedures
   - Context is shared based on specialization and relevance
   - Decisions are made according to defined authority levels

### Configuration

- **Main Configuration**: `claude/subagents.yaml` - Defines all agents and workflows
- **Orchestrator Config**: `claude/orchestrator.yaml` - Master agent configuration
- **Agent Configs**: `claude/agents/*.yaml` - Individual agent specifications

## 🎯 Use Cases

### 1. New Feature Development
**Scenario**: Implement voice chat rooms
- **Orchestrator**: Breaks down into backend API, mobile UI, and database changes
- **RTC Specialist**: Implements Agora integration for room-based calling
- **Backend Developer**: Creates room management APIs
- **Mobile Developer**: Builds room UI and call screens
- **Database Specialist**: Updates schema for room memberships
- **Testing Specialist**: Writes comprehensive tests
- **Documentation Specialist**: Updates API docs

### 2. Bug Investigation
**Scenario**: Users reporting call quality issues
- **Orchestrator**: Coordinates investigation across relevant specialists
- **RTC Specialist**: Analyzes Agora implementation and network issues
- **Backend Developer**: Checks server-side call management
- **Mobile Developer**: Reviews mobile SDK integration
- **Infrastructure Specialist**: Examines network and server performance
- **Testing Specialist**: Reproduces issues and validates fixes

### 3. Security Audit
**Scenario**: Regular security assessment
- **Auth Security Specialist**: Leads comprehensive security review
- **Backend Developer**: Implements security patches
- **Mobile Developer**: Updates mobile security measures
- **Infrastructure Specialist**: Secures deployment environment
- **Testing Specialist**: Validates security implementations

## 📊 Performance Metrics

### Development Metrics
- **Code Quality**: TypeScript compliance, test coverage, documentation completeness
- **Development Velocity**: Tasks completed, bug fix time, feature completion
- **System Health**: API performance, mobile performance, real-time communication quality

### Agent Performance
- **Task Completion**: Timeliness, quality, collaboration effectiveness
- **Knowledge Sharing**: Documentation contributions, cross-agent learning
- **Innovation**: Process improvements, technical innovations

## 🔧 Customization

### Adding New Agents
1. Create agent config in `claude/agents/new-agent.yaml`
2. Define capabilities, responsibilities, and file permissions
3. Update `claude/subagents.yaml` with new agent
4. Configure collaboration protocols in orchestrator

### Modifying Workflows
1. Update workflow definitions in `claude/subagents.yaml`
2. Adjust agent responsibilities and coordination
3. Update handoff protocols and communication flows
4. Test workflow changes with sample scenarios

### Extending Capabilities
1. Add new tools and permissions to agent configurations
2. Update context sources and knowledge bases
3. Modify decision authority boundaries
4. Enhance monitoring and quality metrics

## 🤝 Collaboration Guidelines

### Agent Coordination
- **Handoff Protocol**: Clear context transfer with current state, blockers, and next steps
- **Collaboration Protocol**: Share plans, provide updates, notify of changes, coordinate on shared resources
- **Conflict Resolution**: Escalate to orchestrator with full context for binding decisions

### Knowledge Sharing
- **Global Context**: Project requirements, architecture, API contracts, authentication flows
- **Specialized Context**: Domain-specific knowledge shared based on agent expertise
- **Documentation**: Comprehensive documentation maintained by documentation specialist

## 📈 Scaling the System

### Multi-Project Support
- Configure agent pools for parallel project development
- Implement resource allocation strategies
- Set up cross-project knowledge sharing

### Advanced Features
- Add specialized agents for specific domains (AI/ML, Analytics, etc.)
- Implement intelligent task routing and load balancing
- Create sophisticated monitoring and alerting systems

## 🔒 Security and Privacy

- **Data Protection**: Sensitive information handled according to security specialist guidelines
- **Access Control**: Agents access only necessary files and information
- **Audit Trail**: All decisions and actions logged for transparency
- **Compliance**: System designed to support GDPR, CCPA, and other regulations

## 📞 Support

For questions or issues with the subagent system:
1. Check this README and configuration files
2. Review agent-specific documentation in individual config files
3. Consult the orchestrator configuration for coordination issues
4. Check project documentation for domain-specific questions

## 🔄 Version History

- **v1.0**: Initial release with 10 specialized agents and master orchestrator
- Designed specifically for Banter social voice/video chat application
- Comprehensive workflows for development, testing, and deployment
- Built-in quality metrics and performance monitoring

---

**Created for**: Banter Social Networking Application
**Version**: 1.0
**Last Updated**: 2025-01-07
**Architecture**: Multi-agent system with master orchestrator