const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationHelper {
  // Task-related notifications
  static async notifyTaskAssigned(taskId, taskTitle, assigneeId, assignerId, projectName, dueDate, priority) {
    if (assigneeId.toString() === assignerId.toString()) return null;
    
    return await Notification.createNotification({
      title: 'New Task Assigned',
      message: `You have been assigned to task: ${taskTitle}`,
      type: 'task',
      category: 'task',
      priority: priority === 'urgent' ? 'high' : priority === 'high' ? 'medium' : 'low',
      recipient: assigneeId,
      sender: assignerId,
      actionUrl: `/tasks`,
      actionText: 'View Task',
      relatedEntity: {
        entityType: 'Task',
        entityId: taskId
      },
      metadata: {
        taskTitle,
        taskPriority: priority,
        dueDate,
        projectName
      }
    });
  }

  static async notifyTaskCompleted(taskId, taskTitle, completedById, assignedById, completedByName) {
    if (!assignedById || completedById.toString() === assignedById.toString()) return null;
    
    return await Notification.createNotification({
      title: 'Task Completed',
      message: `Task "${taskTitle}" has been completed by ${completedByName}`,
      type: 'success',
      category: 'task',
      priority: 'medium',
      recipient: assignedById,
      sender: completedById,
      actionUrl: `/tasks`,
      actionText: 'View Task',
      relatedEntity: {
        entityType: 'Task',
        entityId: taskId
      },
      metadata: {
        taskTitle,
        completedBy: completedByName,
        completedDate: new Date()
      }
    });
  }

  static async notifyTaskOverdue(taskId, taskTitle, assigneeId, dueDate) {
    return await Notification.createNotification({
      title: 'Task Overdue',
      message: `Task "${taskTitle}" is overdue! Due date was ${dueDate.toLocaleDateString()}`,
      type: 'warning',
      category: 'task',
      priority: 'high',
      recipient: assigneeId,
      actionUrl: `/tasks`,
      actionText: 'View Task',
      relatedEntity: {
        entityType: 'Task',
        entityId: taskId
      },
      metadata: {
        taskTitle,
        dueDate,
        daysPastDue: Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24))
      }
    });
  }

  static async notifyTaskCommentAdded(taskId, taskTitle, commenterId, commenterName, comment, assigneeId) {
    if (!assigneeId || commenterId.toString() === assigneeId.toString()) return null;
    
    return await Notification.createNotification({
      title: 'New Task Comment',
      message: `${commenterName} commented on task "${taskTitle}": ${comment.substring(0, 100)}${comment.length > 100 ? '...' : ''}`,
      type: 'info',
      category: 'task',
      priority: 'low',
      recipient: assigneeId,
      sender: commenterId,
      actionUrl: `/tasks`,
      actionText: 'View Task',
      relatedEntity: {
        entityType: 'Task',
        entityId: taskId
      },
      metadata: {
        taskTitle,
        commenterName,
        comment: comment.substring(0, 200)
      }
    });
  }

  // Project-related notifications
  static async notifyProjectTeamMemberAdded(projectId, projectName, userId, role, addedById, addedByName) {
    if (userId.toString() === addedById.toString()) return null;
    
    return await Notification.createNotification({
      title: 'Added to Project Team',
      message: `You have been added to project "${projectName}" as ${role}`,
      type: 'project',
      category: 'project',
      priority: 'medium',
      recipient: userId,
      sender: addedById,
      actionUrl: `/projects/${projectId}`,
      actionText: 'View Project',
      relatedEntity: {
        entityType: 'Project',
        entityId: projectId
      },
      metadata: {
        projectName,
        role,
        addedBy: addedByName
      }
    });
  }

  static async notifyProjectUpdated(projectId, projectName, updateType, details, recipientIds, senderId) {
    const notifications = recipientIds
      .filter(id => id.toString() !== senderId.toString())
      .map(recipientId => ({
        title: `Project ${updateType}`,
        message: `${projectName}: ${details}`,
        type: 'project',
        category: 'project',
        priority: 'medium',
        recipient: recipientId,
        sender: senderId,
        actionUrl: `/projects/${projectId}`,
        actionText: 'View Project',
        relatedEntity: {
          entityType: 'Project',
          entityId: projectId
        },
        metadata: {
          projectName,
          updateType,
          details
        }
      }));
    
    if (notifications.length > 0) {
      return await Notification.insertMany(notifications);
    }
    return [];
  }

  static async notifyProjectDeadlineApproaching(projectId, projectName, endDate, teamMemberIds) {
    const daysUntilDeadline = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    
    const notifications = teamMemberIds.map(memberId => ({
      title: 'Project Deadline Approaching',
      message: `Project "${projectName}" deadline is approaching in ${daysUntilDeadline} days`,
      type: 'warning',
      category: 'project',
      priority: daysUntilDeadline <= 3 ? 'high' : 'medium',
      recipient: memberId,
      actionUrl: `/projects/${projectId}`,
      actionText: 'View Project',
      relatedEntity: {
        entityType: 'Project',
        entityId: projectId
      },
      metadata: {
        projectName,
        endDate,
        daysUntilDeadline
      }
    }));
    
    return await Notification.insertMany(notifications);
  }

  // HR-related notifications
  static async notifyLeaveRequest(leaveId, employeeId, employeeName, leaveType, startDate, endDate, managerId) {
    if (!managerId) return null;
    
    return await Notification.createNotification({
      title: 'New Leave Request',
      message: `${employeeName} has requested ${leaveType} leave from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      type: 'hr',
      category: 'hr',
      priority: 'medium',
      recipient: managerId,
      sender: employeeId,
      actionUrl: `/hr/leave-management`,
      actionText: 'Review Request',
      relatedEntity: {
        entityType: 'Leave',
        entityId: leaveId
      },
      metadata: {
        employeeName,
        leaveType,
        startDate,
        endDate,
        duration: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      }
    });
  }

  static async notifyLeaveStatusUpdate(leaveId, employeeId, leaveType, status, startDate, endDate, reviewerId, reviewerName) {
    const statusMessage = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending review';
    
    return await Notification.createNotification({
      title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${leaveType} leave request from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} has been ${statusMessage}`,
      type: status === 'approved' ? 'success' : status === 'rejected' ? 'warning' : 'info',
      category: 'hr',
      priority: 'medium',
      recipient: employeeId,
      sender: reviewerId,
      actionUrl: `/hr/leave-management`,
      actionText: 'View Details',
      relatedEntity: {
        entityType: 'Leave',
        entityId: leaveId
      },
      metadata: {
        leaveType,
        status,
        startDate,
        endDate,
        reviewedBy: reviewerName
      }
    });
  }

  static async notifyAttendanceIssue(employeeId, issueType, date, details) {
    return await Notification.createNotification({
      title: 'Attendance Issue',
      message: `${issueType} detected for ${date.toLocaleDateString()}: ${details}`,
      type: 'warning',
      category: 'hr',
      priority: 'medium',
      recipient: employeeId,
      actionUrl: `/hr/attendance`,
      actionText: 'View Attendance',
      metadata: {
        issueType,
        date,
        details
      }
    });
  }

  static async notifyPayrollGenerated(employeeId, payrollId, period, amount) {
    return await Notification.createNotification({
      title: 'Payroll Generated',
      message: `Your payroll for ${period} has been generated. Amount: $${amount.toFixed(2)}`,
      type: 'success',
      category: 'hr',
      priority: 'medium',
      recipient: employeeId,
      actionUrl: `/hr/payroll`,
      actionText: 'View Payroll',
      relatedEntity: {
        entityType: 'Payroll',
        entityId: payrollId
      },
      metadata: {
        period,
        amount
      }
    });
  }

  // Finance-related notifications
  static async notifyInvoiceCreated(invoiceId, clientId, amount, dueDate, createdById) {
    return await Notification.createNotification({
      title: 'New Invoice Created',
      message: `Invoice created for $${amount.toFixed(2)} due on ${dueDate.toLocaleDateString()}`,
      type: 'finance',
      category: 'finance',
      priority: 'medium',
      recipient: clientId,
      sender: createdById,
      actionUrl: `/finance/invoices`,
      actionText: 'View Invoice',
      relatedEntity: {
        entityType: 'Finance',
        entityId: invoiceId
      },
      metadata: {
        amount,
        dueDate,
        type: 'invoice'
      }
    });
  }

  static async notifyPaymentReceived(invoiceId, clientId, amount, paymentDate) {
    return await Notification.createNotification({
      title: 'Payment Received',
      message: `Payment of $${amount.toFixed(2)} received on ${paymentDate.toLocaleDateString()}`,
      type: 'success',
      category: 'finance',
      priority: 'medium',
      recipient: clientId,
      actionUrl: `/finance/invoices`,
      actionText: 'View Invoice',
      relatedEntity: {
        entityType: 'Finance',
        entityId: invoiceId
      },
      metadata: {
        amount,
        paymentDate,
        type: 'payment'
      }
    });
  }

  static async notifyBudgetExceeded(projectId, projectName, budgetAmount, spentAmount, managerId) {
    const overageAmount = spentAmount - budgetAmount;
    const overagePercentage = ((overageAmount / budgetAmount) * 100).toFixed(1);
    
    return await Notification.createNotification({
      title: 'Budget Exceeded',
      message: `Project "${projectName}" has exceeded budget by $${overageAmount.toFixed(2)} (${overagePercentage}%)`,
      type: 'warning',
      category: 'finance',
      priority: 'high',
      recipient: managerId,
      actionUrl: `/finance/budgets`,
      actionText: 'View Budget',
      relatedEntity: {
        entityType: 'Project',
        entityId: projectId
      },
      metadata: {
        projectName,
        budgetAmount,
        spentAmount,
        overageAmount,
        overagePercentage
      }
    });
  }

  // System and security notifications
  static async notifySecurityAlert(userId, alertType, details, ipAddress) {
    return await Notification.createNotification({
      title: 'Security Alert',
      message: `${alertType}: ${details}`,
      type: 'error',
      category: 'security',
      priority: 'urgent',
      recipient: userId,
      actionUrl: `/profile/security`,
      actionText: 'Review Security',
      metadata: {
        alertType,
        details,
        ipAddress,
        timestamp: new Date()
      }
    });
  }

  static async notifySystemMaintenance(userIds, maintenanceType, scheduledTime, estimatedDuration) {
    const notifications = userIds.map(userId => ({
      title: 'System Maintenance Scheduled',
      message: `${maintenanceType} maintenance scheduled for ${scheduledTime.toLocaleString()}. Estimated duration: ${estimatedDuration}`,
      type: 'system',
      category: 'system',
      priority: 'medium',
      recipient: userId,
      actionUrl: `/system/status`,
      actionText: 'Learn More',
      metadata: {
        maintenanceType,
        scheduledTime,
        estimatedDuration
      }
    }));
    
    return await Notification.insertMany(notifications);
  }

  // Content-related notifications
  static async notifyContentPublished(contentId, contentTitle, authorId, teamMemberIds) {
    const notifications = teamMemberIds
      .filter(id => id.toString() !== authorId.toString())
      .map(memberId => ({
        title: 'New Content Published',
        message: `"${contentTitle}" has been published`,
        type: 'content',
        category: 'content',
        priority: 'medium',
        recipient: memberId,
        sender: authorId,
        actionUrl: `/content`,
        actionText: 'View Content',
        relatedEntity: {
          entityType: 'Content',
          entityId: contentId
        },
        metadata: {
          contentTitle,
          publishedDate: new Date()
        }
      }));
    
    if (notifications.length > 0) {
      return await Notification.insertMany(notifications);
    }
    return [];
  }

  static async notifyContentReviewNeeded(contentId, contentTitle, authorId, reviewerId) {
    return await Notification.createNotification({
      title: 'Content Review Needed',
      message: `"${contentTitle}" is ready for review`,
      type: 'content',
      category: 'content',
      priority: 'medium',
      recipient: reviewerId,
      sender: authorId,
      actionUrl: `/content/${contentId}`,
      actionText: 'Review Content',
      relatedEntity: {
        entityType: 'Content',
        entityId: contentId
      },
      metadata: {
        contentTitle,
        submittedDate: new Date()
      }
    });
  }

  // Analytics and reporting notifications
  static async notifyReportGenerated(reportId, reportName, generatedById, recipientIds) {
    const notifications = recipientIds.map(recipientId => ({
      title: 'Report Generated',
      message: `Report "${reportName}" has been generated and is ready for review`,
      type: 'info',
      category: 'analytics',
      priority: 'low',
      recipient: recipientId,
      sender: generatedById,
      actionUrl: `/analytics/reports/${reportId}`,
      actionText: 'View Report',
      metadata: {
        reportName,
        generatedDate: new Date()
      }
    }));
    
    return await Notification.insertMany(notifications);
  }

  // Bulk notification helpers
  static async notifyMultipleUsers(userIds, notificationData) {
    const notifications = userIds.map(userId => ({
      ...notificationData,
      recipient: userId
    }));
    
    return await Notification.insertMany(notifications);
  }

  static async notifyByRole(roleName, notificationData) {
    const users = await User.find({ role: roleName, isActive: true });
    const userIds = users.map(user => user._id);
    
    return await this.notifyMultipleUsers(userIds, notificationData);
  }
}

module.exports = NotificationHelper;
