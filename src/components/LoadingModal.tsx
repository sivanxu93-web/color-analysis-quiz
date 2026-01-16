import BaseModal from './BaseModal';
import {useCommonContext} from "~/context/common-context";

export default function LoadingModal({
                                       loadingText,
                                     }) {

  const {showLoadingModal, setShowLoadingModal} = useCommonContext();

  return (
    <BaseModal 
      isOpen={showLoadingModal} 
      onClose={() => {}} // Loading modal usually shouldn't be closed by user
      title="Just a moment..."
      icon={<span className="text-4xl animate-spin">⏳</span>}
    >
        <div className="text-center py-4">
            <p className="text-gray-600 font-medium">{loadingText}</p>
        </div>
    </BaseModal>
  )
}
