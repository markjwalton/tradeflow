# Implementation Checklist

Use this checklist when implementing new features to ensure all UX systems are properly integrated.

## New Page Checklist

### Setup
- [ ] Import required loading state components
- [ ] Import error handling utilities
- [ ] Import form validation if forms are used
- [ ] Import accessibility utilities
- [ ] Set up performance monitoring

### Data Fetching
- [ ] Use `useQuery` with proper queryKey
- [ ] Handle loading state with `PageLoader` or skeletons
- [ ] Handle error state with `ErrorRecovery`
- [ ] Add refetch functionality
- [ ] Configure stale time if needed

### Forms (if applicable)
- [ ] Create or use existing Zod schema
- [ ] Use `useValidatedForm` hook
- [ ] Use `ValidatedInput`, `ValidatedTextarea`, `ValidatedSelect`
- [ ] Show inline validation errors
- [ ] Disable submit during submission
- [ ] Reset form after success

### Mutations
- [ ] Use `useMutation` with proper mutationFn
- [ ] Invalidate queries in onSuccess
- [ ] Show success toast
- [ ] Use `useMutationError` for automatic error handling
- [ ] Show loading state on action buttons
- [ ] Handle optimistic updates if needed

### UI/UX
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states for all async operations
- [ ] Empty states when no data
- [ ] Proper spacing and alignment
- [ ] Consistent color scheme
- [ ] Icons for visual clarity

### Accessibility
- [ ] Semantic HTML elements
- [ ] Keyboard navigation support
- [ ] ARIA labels where needed
- [ ] Screen reader announcements for state changes
- [ ] Focus management in modals
- [ ] Sufficient color contrast

### Performance
- [ ] Add performance marks for key operations
- [ ] Use pagination for large datasets
- [ ] Debounce search inputs
- [ ] Optimize images with lazy loading
- [ ] Minimize re-renders

### Testing
- [ ] Test create/read/update/delete operations
- [ ] Test validation (valid and invalid inputs)
- [ ] Test error scenarios
- [ ] Test loading states
- [ ] Test keyboard navigation
- [ ] Test on mobile devices

## New Form Checklist

### Schema Definition
- [ ] Create Zod schema in `FormValidation.js`
- [ ] Include all required fields
- [ ] Add appropriate validation rules
- [ ] Test schema with various inputs

### Form Implementation
- [ ] Use `useValidatedForm(schema)`
- [ ] Use validated components for all inputs
- [ ] Show validation errors inline
- [ ] Add helper text for complex fields
- [ ] Group related fields logically

### Submission
- [ ] Use `handleSubmit` wrapper
- [ ] Create mutation for API call
- [ ] Show loading state during submission
- [ ] Disable submit button when invalid or submitting
- [ ] Handle success and error cases
- [ ] Reset form after success

### User Experience
- [ ] Clear labels for all fields
- [ ] Required field indicators
- [ ] Placeholder text where appropriate
- [ ] Character count for limited fields
- [ ] Confirmation before destructive actions

## New Mutation Checklist

### Setup
- [ ] Create mutation with `useMutation`
- [ ] Define mutationFn
- [ ] Add onSuccess callback
- [ ] Add onError callback (or use useMutationError)
- [ ] Set up loading state

### Integration
- [ ] Invalidate affected queries
- [ ] Show success toast
- [ ] Update UI optimistically if needed
- [ ] Handle errors gracefully
- [ ] Announce changes to screen readers

### Testing
- [ ] Test success case
- [ ] Test error cases (network, validation, server)
- [ ] Test loading states
- [ ] Test concurrent mutations
- [ ] Test with slow network

## Code Review Checklist

### Code Quality
- [ ] No console.errors or warnings
- [ ] Proper TypeScript types (if using TS)
- [ ] No magic numbers or hardcoded values
- [ ] Consistent naming conventions
- [ ] No unused imports or variables
- [ ] Proper code comments for complex logic

### UX Systems
- [ ] All loading states implemented
- [ ] All errors handled properly
- [ ] All forms validated
- [ ] Accessibility features included
- [ ] Performance optimizations applied

### Security
- [ ] Input validation on client and server
- [ ] No sensitive data in console logs
- [ ] Proper authentication checks
- [ ] XSS prevention measures

### Best Practices
- [ ] Components are small and focused
- [ ] No duplicate code
- [ ] Proper use of React hooks
- [ ] Query keys are unique and descriptive
- [ ] Mutations invalidate the right queries

## Pre-Deployment Checklist

### Testing
- [ ] All features tested manually
- [ ] Error scenarios tested
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Performance metrics acceptable
- [ ] No console errors

### Code
- [ ] All TODOs addressed
- [ ] Dev tools disabled in production
- [ ] Performance monitoring configured
- [ ] Error logging configured
- [ ] Analytics integrated (if applicable)

### Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Component usage examples provided
- [ ] Known issues documented

### Deployment
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Build succeeds without errors
- [ ] Staging environment tested
- [ ] Rollback plan prepared