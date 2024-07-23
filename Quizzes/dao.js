
export const savePdfForUser = async (userId, pdfPath) => {
    return await User.findByIdAndUpdate(
        userId,
        { $push: { pdfs: pdfPath } },
        { new: true }
    );
};