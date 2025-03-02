import { Modal } from "react-bootstrap";

const ReusableModal = ({
    showModal,
    handleCloseModal,
    title,
    bodyContent,
    footerContent,
}) => {
    return (
        <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{bodyContent}</Modal.Body>
            <Modal.Footer>{footerContent}</Modal.Footer>
        </Modal>
    );
};

export default ReusableModal;