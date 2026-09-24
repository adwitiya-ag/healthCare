import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import { distributionApi } from "../../api/distributionApi";
import { doctorsApi } from "../../api/doctorsApi.js";
import { productsApi } from "../../api/productsApi.js";
import { Plus } from "lucide-react";
import Modal from "../../components/Modal";
import { useAuth } from '../../context/AuthContext';

const COLUMNS = [
    {
        key: "doctorName",
        label: "Doctor",
        render: (_, row) => row.doctorId?.doctorName || "-",
    },
    {
        key: "productName",
        label: "Product",
        render: (_, row) => row.productId?.productName || "-",
    },
    {
        key: "quantity",
        label: "Quantity",
        render: (v) => <span className="font-semibold">{v}</span>,
    },
    {
        key: "mrName",
        label: "MR/Manager",
        render: (_, row) =>
            row.userId ? `${row.userId.firstName} ${row.userId.lastName}` : "-",
    },
];

export default function DistributionLog() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [products, setProducts] = useState([]);
    const {role} =  useAuth()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { doctorId: "", productId: "", quantity: 1 },
    });

    const loadRecords = useCallback(async () => {
        setLoading(true);
        try {
            const data = await distributionApi.getAll({});
            setRecords(data);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadOptions = useCallback(async () => {
        try {
            const [doctorList, productList] = await Promise.all([
                doctorsApi.getAll(),
                productsApi.getAll(),
            ]);
            console.log(productList);

            setDoctors(doctorList);
            setProducts(productList);
        } catch (err) {
            console.error("Failed to load doctors/products", err);
        }
    }, []);

    useEffect(() => {
        loadRecords();
        loadOptions();
    }, [loadRecords, loadOptions]);

    const openModal = () => {
        reset({ doctorId: "", productId: "", quantity: 1 });
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const onSubmit = async (formData) => {
        try {
            await distributionApi.record({
                doctorId: formData.doctorId,
                productId: formData.productId,
                quantity: Number(formData.quantity) || 1,
            });
            closeModal();
            await loadRecords();
        } catch (err) {
            console.error("Failed to record distribution", err);
        }
    };

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Distribution Log"
                subtitle={`${records.length} records`}
                action={role==="MR" && (
                    <button
                        id="add-product-btn"
                        onClick={openModal}
                        className="btn-primary"
                    >
                        <Plus className="w-4 h-4" /> Record Distribution
                    </button>
                )}
            />

            <DataTable
                columns={COLUMNS}
                data={records}
                loading={loading}
                emptyMessage="No distribution records found"
            />

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title="Record Distribution"
                id="distribution-modal"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="distribution-form">
                    <div>
                        <label className="form-label">Doctor *</label>
                        <select
                            id="dist-doctor"
                            {...register("doctorId", { required: "Doctor is required" })}
                            className={errors.doctorId ? "form-input-error form-select" : "form-select"}
                        >
                            <option value="">Select doctor</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        {errors.doctorId && <p className="form-error">⚠ {errors.doctorId.message}</p>}
                    </div>

                    <div>
                        <label className="form-label">Product *</label>
                        <select
                            id="dist-product"
                            {...register("productId", { required: "Product is required" })}
                            className={errors.productId ? "form-input-error form-select" : "form-select"}
                        >
                            <option value="">Select product</option>
                            {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.productName}
                                </option>
                            ))}
                        </select>
                        {errors.productId && <p className="form-error">⚠ {errors.productId.message}</p>}
                    </div>

                    <div>
                        <label className="form-label">Quantity *</label>
                        <input
                            id="dist-quantity"
                            type="number"
                            min="1"
                            {...register("quantity", {
                                required: "Quantity is required",
                                min: { value: 1, message: "Quantity must be at least 1" },
                            })}
                            className={errors.quantity ? "form-input-error" : "form-input"}
                            placeholder="1"
                        />
                        {errors.quantity && <p className="form-error">⚠ {errors.quantity.message}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            id="dist-cancel"
                            type="button"
                            onClick={closeModal}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            id="dist-save"
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary flex-1"
                        >
                            {isSubmitting ? "Saving…" : "Record"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}