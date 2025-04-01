const { v4: uuidv4 } = require('uuid');

class TokomiDatabase {
    constructor() {
        this.tickets = new Map();
        this.users = new Map();
        this.orders = new Map();
        this.testimonials = new Map();
        this.ticketCounters = new Map();
    }

    // =============== TICKET SYSTEM ===============
    async createTicket(ticketData) {
        const ticketId = uuidv4();
        const ticketNumber = this.getNextTicketNumber(ticketData.category);
        
        const ticket = {
            id: ticketId,
            ticketNumber,
            ...ticketData,
            createdAt: new Date(),
            closed: false,
            claimedBy: null,
            messages: []
        };

        this.tickets.set(ticketData.channelId, ticket);
        
        // Update user's ticket list
        if (!this.users.has(ticketData.userId)) {
            this.users.set(ticketData.userId, {
                activeTickets: [],
                allTickets: []
            });
        }
        const user = this.users.get(ticketData.userId);
        user.activeTickets.push(ticketData.channelId);
        user.allTickets.push(ticketData.channelId);

        return ticket;
    }

    getNextTicketNumber(category) {
        const count = (this.ticketCounters.get(category) || 0) + 1;
        this.ticketCounters.set(category, count);
        return `${category.slice(0, 3).toUpperCase()}${count.toString().padStart(4, '0')}`;
    }

    async getTicket(channelId) {
        return this.tickets.get(channelId) || null;
    }

    async getUserTickets(userId) {
        const user = this.users.get(userId);
        if (!user) return [];
        
        return user.activeTickets
            .map(channelId => this.tickets.get(channelId))
            .filter(ticket => ticket && !ticket.closed);
    }

    async closeTicket(channelId) {
        const ticket = this.tickets.get(channelId);
        if (!ticket) return false;
        
        ticket.closed = true;
        ticket.closedAt = new Date();
        
        // Remove from user's active tickets
        const user = this.users.get(ticket.userId);
        if (user) {
            user.activeTickets = user.activeTickets.filter(
                id => id !== channelId
            );
        }
        
        return true;
    }

    async claimTicket(channelId, staffId) {
        const ticket = this.tickets.get(channelId);
        if (!ticket) return null;
        
        ticket.claimedBy = staffId;
        ticket.claimedAt = new Date();
        
        return ticket;
    }

    async addTicketMessage(channelId, messageData) {
        const ticket = this.tickets.get(channelId);
        if (!ticket) return false;
        
        ticket.messages.push({
            id: uuidv4(),
            ...messageData,
            timestamp: new Date()
        });
        
        return true;
    }

    // =============== ORDER SYSTEM ===============
    async createOrder(orderData) {
        const orderId = uuidv4();
        const order = {
            id: orderId,
            ...orderData,
            createdAt: new Date(),
            status: 'pending',
            history: [{
                status: 'pending',
                timestamp: new Date()
            }]
        };
        
        this.orders.set(orderId, order);
        return order;
    }

    async updateOrderStatus(orderId, status, staffId = null) {
        const order = this.orders.get(orderId);
        if (!order) return false;
        
        order.status = status;
        order.history.push({
            status,
            staffId,
            timestamp: new Date()
        });
        
        return true;
    }

    // =============== TESTIMONIAL SYSTEM ===============
    async createTestimonial(testimonialData) {
        const testimonialId = uuidv4();
        const testimonial = {
            id: testimonialId,
            ...testimonialData,
            createdAt: new Date(),
            approved: false
        };
        
        this.testimonials.set(testimonialId, testimonial);
        return testimonial;
    }

    async approveTestimonial(testimonialId, staffId) {
        const testimonial = this.testimonials.get(testimonialId);
        if (!testimonial) return false;
        
        testimonial.approved = true;
        testimonial.approvedBy = staffId;
        testimonial.approvedAt = new Date();
        
        return true;
    }
}

module.exports = new TokomiDatabase();