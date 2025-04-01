// utils/testimonials.js
module.exports = {
    data: [],
    lastId: 0,
    addTestimonial(user, product, feedback) {
        const testimonial = {
            id: `TESTI-${++this.lastId}`,
            userId: user.id,
            username: user.tag,
            userAvatar: user.displayAvatarURL(),
            product,
            feedback,
            date: new Date(),
            approved: false
        };
        this.data.push(testimonial);
        return testimonial;
    },
    getPendingTestimonials() {
        return this.data.filter(t => !t.approved);
    },
    approveTestimonial(id, approvedBy) {
        const testimonial = this.data.find(t => t.id === id);
        if (testimonial) {
            testimonial.approved = true;
            testimonial.approvedBy = approvedBy;
            testimonial.approvedAt = new Date();
            return testimonial;
        }
        return null;
    }
};