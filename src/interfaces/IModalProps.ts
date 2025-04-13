export interface IModalProps {
    message: string;
    loading?: boolean;
    onClose: () => void;
  }
  


export interface IModalPropsForm extends IModalProps {
  onConfirm?: () => void;
}
